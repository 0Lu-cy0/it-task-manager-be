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

const createNew = async (data) => {
  if (!data.created_by) {
    throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.UNAUTHORIZED)
  }

  // Tạo dự án mới
  const project = await projectRepository.createNew(data)

  // Lấy danh sách vai trò mặc định
  const defaultRoles = await defaultRolesModel.find({ _destroy: false }).lean()
  if (!defaultRoles || defaultRoles.length === 0) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không tìm thấy vai trò mặc định')
  }

  // Kiểm tra vai trò owner
  const hasOwnerRole = defaultRoles.some((role) => role.name === 'owner')
  if (!hasOwnerRole) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Vai trò owner không tồn tại')
  }

  // Validate permissions
  const permissionIds = [...new Set(defaultRoles.flatMap((role) => role.permissions).map(id => id.toString()))]
  const existingPermissions = (await permissionModel
    .find({ _id: { $in: permissionIds }, _destroy: false })
    .distinct('_id')).map(id => id.toString())
  const invalidPermissions = permissionIds.filter((id) => !existingPermissions.includes(id))
  if (invalidPermissions.length > 0) {
    // Lấy tên permissions để thông báo lỗi rõ ràng hơn
    const invalidPermissionDetails = await permissionModel
      .find({ _id: { $in: invalidPermissions } })
      .lean()
    const invalidPermissionNames = invalidPermissionDetails.map(p => p.name || p._id)
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Một số quyền không hợp lệ: ${invalidPermissionNames.join(', ')}`,
    )
  }

  // Tạo project_roles
  const projectRoles = defaultRoles.map((role) => ({
    project_id: project._id,
    name: role.name,
    description: role.description,
    permissions: role.permissions, // Đã là [ObjectId]
    default_role_id: role._id,
    created_at: new Date(),
    updated_at: new Date(),
    _destroy: false,
  }))

  // Chèn các vai trò vào collection project_roles
  await projectRolesModel.insertMany(projectRoles)

  // Gán người tạo làm owner
  const ownerRole = await projectRolesModel.findOne({ project_id: project._id, name: 'owner' })
  if (!ownerRole) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không tìm thấy vai trò owner')
  }

  await projectRepository.addMember(project._id, {
    user_id: data.created_by,
    project_role_id: ownerRole._id,
    joined_at: new Date(),
  })

  return await projectRepository.findOneById(project._id)
}

const getAll = async (userId, { page = 1, limit = 10, sortBy = 'created_at', order = 'desc', status, priority } = {}) => {
  const filter = {
    'members.user_id': userId,
    _destroy: false,
  }
  if (status) filter.status = status
  if (priority) filter.priority = priority

  const sort = { [sortBy]: order === 'desc' ? -1 : 1 }
  const options = { skip: (page - 1) * limit, limit: parseInt(limit) }

  const projects = await projectRepository.getAll(filter, sort, options)
  if (projects.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NO_PROJECTS_FOUND)
  }
  return projects
}

const getProjectById = async (projectId) => {
  return await projectRepository.findOneById(projectId)
}

const addProjectMember = async (projectId, userId, roleId) => {

  const project = await projectRepository.findOneById(projectId)
  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Dự án không tồn tại')
  }
  // Kiểm tra xem user_id đã tồn tại trong dự án chưa
  if (project.members.some(m => m.user_id._id.toString() === userId.toString())) {
    throw new ApiError(StatusCodes.CONFLICT, 'Thành viên đã tồn tại trong dự án')
  }
  // Kiểm tra xem user_id có tồn tại trong hệ thống không
  const userExists = await authModel.findById(userId)
  if (!userExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }

  // Kiểm tra vai trò tồn tại
  const role = await projectRolesModel.findById(roleId).lean()
  // const role = null
  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại')
  }
  return await projectRepository.addMember(projectId, {
    user_id: userId,
    project_role_id: roleId,
    joined_at: new Date(),
  })
}

const removeProjectMember = async (projectId, userId, requesterId) => {
  const project = await projectRepository.findOneById(projectId)
  const requester = project.members.find(m => m.user_id.toString() === requesterId.toString())
  if (!requester) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không phải thành viên của dự án')
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
  return await projectRepository.removeMember(projectId, userId)
}
//Cập nhật role của thành viên trong dự án
const updateProjectMemberRole = async (projectId, changes) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    //Kiểm tra dự án
    const project = await projectModel.findById(projectId).session(session)
    if (!project || project._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
    }

    // Kiểm tra user hợp lệ, user trong nhóm dữ liệu mà người dùng gửi lên có thuộc project hay không
    const userIds = changes.map(c => String(c.user_id))
    const invalidUsers = userIds.filter(
      userId => !project.members.some(m => String(m.user_id._id) === userId),
    )
    if (invalidUsers.length > 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Các thành viên không tồn tại trong dự án: ${invalidUsers.join(', ')}`,
      )
    }

    // Kiểm tra role hợp lệ
    const roleIds = changes.map(c => c.project_role_id)

    const roles = await projectRolesModel.find({
      project_id: projectId,
      _id: { $in: roleIds },
    }).lean()
    const roleMap = new Map(roles.map(r => [String(r._id), r]))
    const invalidRoles = roleIds.filter(id => !roleMap.has(String(id)))
    if (invalidRoles.length > 0) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Các vai trò không tồn tại: ${invalidRoles.join(', ')}`,
      )
    }

    // Tìm role lead trong project
    const leadRole = roles.find(r => r.name === 'lead')
    if (!leadRole) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy vai trò lead trong dự án')
    }
    // Kiểm tra số lượng lead
    const leadChanges = changes.filter(c => String(c.project_role_id) === String(leadRole._id))
    if (leadChanges.length > 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Chỉ được phép gán tối đa một lead trong dự án')
    }

    // Nếu có gán lead mới → hạ lead cũ xuống member
    if (leadChanges.length === 1) {
      const [leadRole, memberRole] = await Promise.all([
        projectRolesModel.findOne({ project_id: projectId, name: 'lead' }).lean(),
        projectRolesModel.findOne({ project_id: projectId, name: 'member' }).lean(),
      ])
      if (!leadRole || !memberRole) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Thiếu role lead/member trong dự án')
      }
      const newLeadUserId = String(leadChanges[0].user_id)

      const oldLeads = project.members.filter(
        m => String(m.project_role_id._id) === String(leadRole._id) &&
          String(m.user_id._id) !== newLeadUserId,
      )

      if (oldLeads.length > 0) {
        await Promise.all(
          oldLeads.map(oldLead =>
            projectRepository.updateMemberRole(projectId, String(oldLead.user_id._id), memberRole._id, session),
          ),
        )
      }
    }

    // Cập nhật role cho từng user trong changes
    const results = await Promise.all(
      changes.map(async (c) => {
        const roleId = roleMap.get(String(c.project_role_id))
        return projectRepository.updateMemberRole(projectId, c.user_id, roleId._id, session)
      }),
    )

    await session.commitTransaction()
    return results
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}


const getProjectRoles = async (projectId) => {
  const project = await projectRepository.findOneById(projectId)
  return await projectRolesModel.find({ project_id: projectId }).lean()
}

const getProjectLead = async (projectId) => {
  const project = await projectRepository.findOneById(projectId)
  const lead = await Promise.resolve(project.members.find(async m => {
    const role = await projectRolesModel.findById(m.project_role_id).lean()
    return role.name === 'lead'
  }))
  if (!lead) return null
  const user = await authModel.findById(lead.user_id).select('name email').lean()
  return { user_id: lead.user_id, name: user.name, email: user.email }
}

const deleteProject = async (projectId) => {
  return await projectRepository.softDelete(projectId)
}

const verifyProjectPermission = async (projectId, userId, permissionName) => {
  return await projectRepository.checkUserPermission(
    projectId,
    userId,
    permissionName,
  )
}

const updateProject = async (projectId, updateData) => {
  // const project = await projectRepository.findOneById(projectId)
  // const member = project.members.find(m => m.user_id.toString() === userId.toString())
  // if (!member) {
  //   throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không phải thành viên của dự án')
  // }
  // const role = await projectRolesModel.findById(member.project_role_id).lean()
  // const editProjectPermissionId = await getPermissionId('edit_project')
  // if (!role.permissions.includes(editProjectPermissionId)) {
  //   throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  // }
  return await projectRepository.update(projectId, updateData)
}

const toggleFreeMode = async ({ projectId, free_mode, currentUserId }) => {
  await projectValidation.validateToggleFreeMode({ projectId, free_mode })

  // Lấy project
  const project = await projectRepository.findOneById(projectId)
  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project không tồn tại')
  }

  // Helper: chuẩn hóa userId từ member
  const normalizeId = (id) =>
    typeof id === 'object' && id?._id ? id._id.toString() : id.toString()

  // Tìm currentUser trong members
  const member = project.members.find(
    (m) => normalizeId(m.user_id) === currentUserId.toString(),
  )
  if (!member) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không thuộc project này')
  }

  // Check quyền owner
  const isOwner = member.project_role_id?.name === 'owner'
  if (!isOwner) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ owner mới được phép thao tác')
  }

  // Update free_mode
  return await projectRepository.updateFreeMode(projectId, free_mode)
}


export const projectService = {
  createNew,
  getAll,
  updateProject,
  deleteProject,
  getProjectById,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  getProjectRoles,
  getProjectLead,
  verifyProjectPermission,
  toggleFreeMode,
}
