import { projectRepository } from '~/repository/projectRepository'
import { projectRolesModel } from '~/models/projectRolesModel'
import { authModel } from '~/models/authModel'
import { projectValidation } from '~/validations/projectValidation'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'
import { defaultRolesModel } from '~/models/defaultRolesModel'
import { permissionModel } from '~/models/permissionModel'
import { getPermissionId } from '~/utils/permission'
import mongoose from 'mongoose'
import { projectModel } from '~/models/projectModel'
import { taskModel } from '~/models/taskModel'
import { inviteModel } from '~/models/inviteModel'
import { accessRequestModel } from '~/models/accessRequestModel'
import { notificationModel } from '~/models/notificationModel'
import { columnModal } from '~/models/columnModal'
import { syncProjectToMeili, deleteProjectFromMeili } from '~/repository/searchRepository'
import { withTransaction } from '~/utils/mongooseHelper'

// Hàm touch để cập nhật last_activity
const touch = async (projectId, time = new Date(), options = {}) => {
  try {
    return await projectModel.updateOne(
      { _id: projectId },
      { $max: { last_activity: time } },
      options // Hỗ trợ session cho transaction
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error updating last_activity for project ${projectId}:`, error)
    throw error
  }
}

// Hàm recompute last_activity khi cần (dùng sau này cho taskService)
const recomputeLastActivity = async (projectId, options = {}) => {
  try {
    const res = await taskModel.aggregate([
      { $match: { project_id: mongoose.Types.ObjectId(projectId), _destroy: false } },
      { $group: { _id: null, maxTaskUpdated: { $max: '$updatedAt' } } },
    ])
    const maxTaskUpdated = res[0]?.maxTaskUpdated || null
    const project = await projectModel.findById(projectId).lean()
    const last =
      project.updatedAt > (maxTaskUpdated || new Date(0)) ? project.updatedAt : maxTaskUpdated
    return await projectModel.updateOne(
      { _id: projectId },
      { $set: { last_activity: last || project.updatedAt } },
      options
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error recomputing last_activity for project ${projectId}:`, error)
    throw error
  }
}

const createNew = async data => {
  return await withTransaction(async session => {
    if (!data.created_by) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.UNAUTHORIZED)
    }

    // Tạo dự án mới
    const project = await projectRepository.createNew(
      { ...data, last_activity: new Date() },
      { session }
    )

    // Lấy danh sách vai trò mặc định
    const defaultRoles = await defaultRolesModel.find({ _destroy: false }).lean()
    if (!defaultRoles || defaultRoles.length === 0) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, MESSAGES.DEFAULT_ROLE_NOT_FOUND)
    }

    // Kiểm tra vai trò owner
    const hasOwnerRole = defaultRoles.some(role => role.name === 'owner')
    if (!hasOwnerRole) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, MESSAGES.ROLE_OWNER_NOT_FOUND)
    }

    // Validate permissions
    const permissionIds = [
      ...new Set(defaultRoles.flatMap(role => role.permissions).map(id => id.toString())),
    ]
    const existingPermissions = (
      await permissionModel.find({ _id: { $in: permissionIds }, _destroy: false }).distinct('_id')
    ).map(id => id.toString())

    const invalidPermissions = permissionIds.filter(id => !existingPermissions.includes(id))

    if (invalidPermissions.length > 0) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Một số quyền không tồn tại hoặc đã bị xóa: ${invalidPermissions.join(', ')}`
      )
    }

    // Tạo project_roles
    const projectRoles = defaultRoles.map(role => ({
      project_id: project._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      default_role_id: role._id,
      created_at: new Date(),
      updated_at: new Date(),
      _destroy: false,
    }))

    // Chèn các vai trò
    await projectRolesModel.insertMany(projectRoles, { session })

    // Gán người tạo làm owner
    const ownerRole = await projectRolesModel
      .findOne({ project_id: project._id, name: 'owner' })
      .session(session)
    if (!ownerRole) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, MESSAGES.ROLE_OWNER_REQUIRED)
    }

    await projectRepository.addMember(
      project._id,
      {
        user_id: data.created_by,
        project_role_id: ownerRole._id,
        joined_at: new Date(),
      },
      { session }
    )

    // Cập nhật last_activity
    await touch(project._id, new Date(), { session })

    // Tạo permanent invite link cho project
    const { inviteService } = await import('~/services/inviteService')
    const permanentInvite = await inviteService.createPermanentInvite(
      project._id,
      data.created_by,
      'member',
      session // ← Truyền session để đọc uncommitted data
    )

    // Sync with MeiliSearch after successful transaction
    // Pass the session to findOneById to read uncommitted data
    const fullProject = await projectRepository.findOneById(project._id, { session })
    await syncProjectToMeili(fullProject)

    const result = await projectRepository.findOneById(project._id, { session })

    // Thêm permanent invite link vào response
    // result đã là plain object (có .lean() trong repository) nên không cần .toObject()
    return {
      ...result,
      permanent_invite_link: permanentInvite.invite_link,
      permanent_invite_token: permanentInvite.invite_token,
    }
  })
}

const getAll = async (
  userId,
  { page = 1, limit = 10, sortBy = 'created_at', order = 'desc', status, priority, visibility } = {}
) => {
  // Build filter: user có thể xem projects mà họ là member HOẶC projects public
  const filter = {
    _destroy: false,
    $or: [
      { 'members.user_id': userId }, // Projects user là member
      { visibility: 'public' }, // Hoặc projects public
    ],
  }

  if (status) filter.status = status
  if (priority) filter.priority = priority
  if (visibility) filter.visibility = visibility

  const sort = { [sortBy]: order === 'desc' ? -1 : 1 }
  const options = { skip: (page - 1) * limit, limit: parseInt(limit) }

  const projects = await projectRepository.getAll(filter, sort, options)
  if (projects.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NO_PROJECTS_FOUND)
  }
  return projects
}

const getProjectById = async (projectId, userId = null) => {
  const project = await projectRepository.findOneById(projectId)

  // Nếu project là private, kiểm tra xem user có phải member không
  if (project.visibility === 'private' && userId) {
    const isMember = project.members.some(m => m.user_id._id.toString() === userId.toString())
    if (!isMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
    }
  }

  return project
}

const addProjectMember = async (projectId, userId, roleId) => {
  return await withTransaction(async session => {
    const project = await projectRepository.findOneById(projectId)
    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }
    if (project.members.some(m => m.user_id._id.toString() === userId.toString())) {
      throw new ApiError(StatusCodes.CONFLICT, MESSAGES.MEMBER_ALREADY_EXISTS)
    }
    const userExists = await authModel.findById(userId).session(session)
    if (!userExists) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
    }
    const role = await projectRolesModel.findById(roleId).lean()
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND)
    }
    await projectRepository.addMember(
      projectId,
      {
        user_id: userId,
        project_role_id: roleId,
        joined_at: new Date(),
      },
      { session }
    )
    await touch(projectId, new Date(), { session })
  })
}

const removeProjectMember = async (projectId, userId, requesterId) => {
  return await withTransaction(async session => {
    const project = await projectRepository.findOneById(projectId)
    const requester = project.members.find(m => m.user_id.toString() === requesterId.toString())
    if (!requester) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.MEMBER_NOT_IN_PROJECT)
    }
    const role = await projectRolesModel.findById(requester.project_role_id).lean()
    const addMemberPermissionId = await getPermissionId('add_member')
    if (!role.permissions.includes(addMemberPermissionId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
    }
    const isMember = project.members.some(member => member.user_id.toString() === userId)
    if (!isMember) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_MEMBER)
    }

    // CASCADE DELETE: Unassign tất cả tasks được gán cho member
    await taskModel.updateMany(
      { project_id: projectId, 'assigned_to.user_id': userId },
      { $pull: { assigned_to: { user_id: userId } } },
      { session }
    )

    // CASCADE DELETE: Xóa tất cả invites do member này gửi
    await inviteModel.deleteMany({ project_id: projectId, invited_by: userId }, { session })

    // CASCADE DELETE: Xóa access requests của member (nếu có)
    await accessRequestModel.deleteMany({ project_id: projectId, user_id: userId }, { session })

    const result = await projectRepository.removeMember(projectId, userId, { session })
    await touch(projectId, new Date(), { session })
    return result
  })
}

const updateProjectMemberRole = async (projectId, changes) => {
  return await withTransaction(async session => {
    const project = await projectModel.findById(projectId).session(session)
    if (!project || project._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }
    const userIds = changes.map(c => String(c.user_id))
    const invalidUsers = userIds.filter(
      userId => !project.members.some(m => String(m.user_id._id) === userId)
    )
    if (invalidUsers.length > 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Các thành viên không tồn tại trong dự án: ${invalidUsers.join(', ')}`
      )
    }
    const roleIds = changes.map(c => c.project_role_id)
    const roles = await projectRolesModel
      .find({
        project_id: projectId,
        _id: { $in: roleIds },
      })
      .lean()
    const roleMap = new Map(roles.map(r => [String(r._id), r]))
    const invalidRoles = roleIds.filter(id => !roleMap.has(String(id)))
    if (invalidRoles.length > 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Các vai trò không tồn tại: ${invalidRoles.join(', ')}`
      )
    }
    const leadRole = roles.find(r => r.name === 'lead')
    if (!leadRole) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_LEAD_NOT_FOUND)
    }
    const leadChanges = changes.filter(c => String(c.project_role_id) === String(leadRole._id))
    if (leadChanges.length > 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.ROLE_LEAD_MAX_ONE)
    }
    if (leadChanges.length === 1) {
      const [leadRole, memberRole] = await Promise.all([
        projectRolesModel.findOne({ project_id: projectId, name: 'lead' }).lean(),
        projectRolesModel.findOne({ project_id: projectId, name: 'member' }).lean(),
      ])
      if (!leadRole || !memberRole) {
        throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_LEAD_OR_MEMBER_NOT_FOUND)
      }
      const newLeadUserId = String(leadChanges[0].user_id)
      const oldLeads = project.members.filter(
        m =>
          String(m.project_role_id._id) === String(leadRole._id) &&
          String(m.user_id._id) !== newLeadUserId
      )
      if (oldLeads.length > 0) {
        await Promise.all(
          oldLeads.map(oldLead =>
            projectRepository.updateMemberRole(
              projectId,
              String(oldLead.user_id._id),
              memberRole._id,
              session
            )
          )
        )
      }
    }
    const results = await Promise.all(
      changes.map(async c => {
        const roleId = roleMap.get(String(c.project_role_id))
        return projectRepository.updateMemberRole(projectId, c.user_id, roleId._id, session)
      })
    )
    await touch(projectId, new Date(), { session })
    return results
  })
}

const getProjectRoles = async projectId => {
  // Validate project exists
  await projectRepository.findOneById(projectId)
  return await projectRolesModel.find({ project_id: projectId, _destroy: false }).lean()
}

const getProjectMembers = async projectId => {
  // Validate project exists và lấy thông tin members
  const project = await projectRepository.findOneById(projectId)

  if (!project || !project.members || project.members.length === 0) {
    return []
  }

  // Transform members data để trả về thông tin cần thiết
  const members = project.members.map(member => ({
    user_id: member.user_id._id,
    name: member.user_id.name,
    email: member.user_id.email,
    role: member.project_role_id.name,
    role_id: member.project_role_id._id,
    joined_at: member.joined_at,
  }))

  return members
}

const getAllMembers = async userId => {
  // Lấy tất cả projects mà user là owner/creator với populate
  const projects = await projectModel
    .find({
      _destroy: false,
      created_by: userId,
    })
    .sort({ created_at: -1 })
    .populate('members.user_id', 'name email')
    .populate('members.project_role_id', 'name')
    .lean()
    .exec()

  if (!projects || projects.length === 0) {
    return []
  }

  // Collect tất cả members từ các projects (loại bỏ duplicate)
  const membersMap = new Map()

  projects.forEach(project => {
    if (project.members && project.members.length > 0) {
      project.members.forEach(member => {
        const userId = member.user_id._id.toString()
        if (!membersMap.has(userId)) {
          membersMap.set(userId, {
            user_id: member.user_id._id,
            name: member.user_id.name,
            email: member.user_id.email,
            role: member.project_role_id.name,
            role_id: member.project_role_id._id,
            joined_at: member.joined_at,
          })
        }
      })
    }
  })

  return Array.from(membersMap.values())
}

const getProjectLead = async projectId => {
  const project = await projectRepository.findOneById(projectId)
  if (!project || !project.members) {
    return null
  }

  // The role is already populated by findOneById, so we can access its name directly.
  const leadMember = project.members.find(
    m => m.project_role_id && m.project_role_id.name === 'lead'
  )

  if (!leadMember) {
    return null
  }

  // The user is also populated, so we can access user details directly.
  const user = leadMember.user_id
  if (!user) {
    return null
  }

  return { user_id: user._id, name: user.name, email: user.email }
}

const deleteProject = async projectId => {
  return await withTransaction(async session => {
    // CASCADE DELETE: Xóa tất cả tasks trong project
    const tasks = await taskModel.find({ project_id: projectId }).session(session)
    const taskIds = tasks.map(task => task._id)
    await taskModel.deleteMany({ project_id: projectId }, { session })

    // CASCADE DELETE: Xóa tất cả columns trong project
    await columnModal.deleteMany({ project_id: projectId }, { session })

    // CASCADE DELETE: Xóa tất cả invites của project
    await inviteModel.deleteMany({ project_id: projectId }, { session })

    // CASCADE DELETE: Xóa tất cả access requests của project
    await accessRequestModel.deleteMany({ project_id: projectId }, { session })

    // CASCADE DELETE: Xóa tất cả notifications liên quan đến project
    await notificationModel.deleteMany({ project_id: projectId }, { session })

    // CASCADE DELETE: Xóa tất cả project roles (trừ default roles)
    await projectRolesModel.deleteMany(
      {
        project_id: projectId,
        is_default: { $ne: true },
      },
      { session }
    )

    // Soft delete project
    const result = await projectRepository.softDelete(projectId, { session })
    await touch(projectId, new Date(), { session })

    // Sync with MeiliSearch after successful transaction
    if (result) {
      await deleteProjectFromMeili(projectId)
      // Xóa tasks khỏi MeiliSearch
      for (const taskId of taskIds) {
        const { deleteTaskFromMeili } = await import('~/repository/searchRepository')
        await deleteTaskFromMeili(taskId)
      }
    }
    return result
  })
}

const verifyProjectPermission = async (projectId, userId, permissionName) => {
  return await projectRepository.checkUserPermission(projectId, userId, permissionName)
}

const updateProject = async (projectId, updateData) => {
  return await withTransaction(async session => {
    const result = await projectRepository.update(projectId, updateData, { session })
    await touch(projectId, new Date(), { session })

    // Sync with MeiliSearch after successful transaction
    if (result) {
      const updatedProject = await projectRepository.findOneById(projectId)
      await syncProjectToMeili(updatedProject)
    }
    return result
  })
}

const toggleFreeMode = async ({ projectId, free_mode, currentUserId }) => {
  return await withTransaction(async session => {
    await projectValidation.validateToggleFreeMode({ projectId, free_mode })
    const project = await projectRepository.findOneById(projectId)
    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }
    const normalizeId = id =>
      typeof id === 'object' && id?._id ? id._id.toString() : id.toString()
    const member = project.members.find(m => normalizeId(m.user_id) === currentUserId.toString())
    if (!member) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.MEMBER_NOT_BELONG_TO_PROJECT)
    }
    const isOwner = member.project_role_id?.name === 'owner'
    if (!isOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.ROLE_OWNER_PERMISSION_ONLY)
    }
    const result = await projectRepository.updateFreeMode(projectId, free_mode, { session })
    await touch(projectId, new Date(), { session })
    return result
  })
}

const reorderColumns = async (projectId, columnOrderIds, currentUserId) => {
  return await withTransaction(async session => {
    // Verify project exists
    const project = await projectRepository.findOneById(projectId)
    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }

    // Verify user is a member of the project
    const normalizeId = id =>
      typeof id === 'object' && id?._id ? id._id.toString() : id.toString()
    const member = project.members.find(m => normalizeId(m.user_id) === currentUserId.toString())
    if (!member) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.MEMBER_NOT_BELONG_TO_PROJECT)
    }

    // Reorder columns
    const result = await projectRepository.reorderColumns(projectId, columnOrderIds, { session })
    await touch(projectId, new Date(), { session })

    return result
  })
}

export const projectService = {
  createNew,
  getAll,
  getProjectById,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  getProjectRoles,
  getProjectMembers,
  getAllMembers,
  getProjectLead,
  deleteProject,
  verifyProjectPermission,
  updateProject,
  toggleFreeMode,
  reorderColumns,
  touch,
  recomputeLastActivity,
}
