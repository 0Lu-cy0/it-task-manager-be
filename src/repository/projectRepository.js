import { projectModel } from '~/models/projectModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'
import { projectRolesModel } from '~/models/projectRolesModel'
import { getPermissionId } from '~/utils/permission'

const createNew = async (data, options = {}) => {
  const result = await projectModel.create([data], options)
  return result[0]
}

const findOneById = async (id, options = {}) => {
  const project = await projectModel
    .findById(id)
    .session(options.session || null) // Use the session for the query
    .populate('created_by', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.project_role_id', 'name')
    .populate({
      path: 'tasks',
      match: { _destroy: false },
      select: 'name priority description status',
    })
    .lean()
    .exec()
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  return project
}

const getAll = async (filter = { _destroy: false }, sort = { created_at: -1 }, options = {}) => {
  if (!filter || typeof filter !== 'object') {
    throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.INVALID_FILTER)
  }
  const projects = await projectModel
    .find(filter)
    .sort(sort)
    .setOptions(options)
    .select('-start_date -created_by -deputy_lead -created_at -updated_at -__v')
    .lean()
    .exec()
  return projects
}

const update = async (projectId, updateData, options = {}) => {
  const project = await projectModel.findById(projectId).session(options.session || null)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  return await projectModel
    .findByIdAndUpdate(projectId, updateData, { new: true, ...options })
    .populate('created_by', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.project_role_id', 'name')
    .exec()
}

const addMember = async (projectId, memberData, options = {}) => {
  const project = await projectModel.findById(projectId).session(options.session || null)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.members.push(memberData)
  project.member_count = project.members.length
  const savedProject = await project.save(options)

  return await savedProject.populate([
    { path: 'created_by', select: 'name email' },
    { path: 'members.user_id', select: 'name email' },
    { path: 'members.project_role_id', select: 'name' },
  ])
}

const removeMember = async (projectId, userId, options = {}) => {
  const project = await projectModel.findById(projectId).session(options.session || null)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.members = project.members.filter(member => member.user_id.toString() !== userId)
  project.member_count = project.members.length
  return await project
    .save(options)
    .then(doc =>
      doc
        .populate('created_by', 'name email')
        .populate('members.user_id', 'name email')
        .populate('members.project_role_id', 'name')
        .execPopulate()
    )
}

const updateMemberRole = async (projectId, userId, projectRoleId, session = null) => {
  const project = await projectModel.findById(projectId).session(session)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  const updatedProject = await projectModel
    .findOneAndUpdate(
      { _id: projectId, 'members.user_id': userId },
      { $set: { 'members.$.project_role_id': projectRoleId } },
      { new: true, session }
    )
    .populate('created_by', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.project_role_id', 'name')
    .exec()
  if (!updatedProject) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_MEMBER)
  }
  return updatedProject
}

const checkUserPermission = async (projectId, userId, permissionName = null) => {
  // Kiểm tra project có tồn tại không (không check member)
  const projectExists = await projectModel
    .findOne({
      _id: projectId,
      _destroy: false,
    })
    .lean()

  if (!projectExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }

  // Tìm project chứa user này (check member)
  const project = await projectModel
    .findOne({
      _id: projectId,
      'members.user_id': userId,
      _destroy: false,
    })
    .lean()

  // Nếu user không phải member → return false (để middleware throw FORBIDDEN)
  if (!project) {
    return false
  }

  // Lấy tất cả roles của user trong project
  const memberRoles = project.members
    .filter(m => m.user_id.toString() === userId.toString())
    .map(m => m.project_role_id)

  if (memberRoles.length === 0) {
    return false
  }

  // Kiểm tra nếu user là owner → pass ngay
  const ownerRole = await projectRolesModel
    .findOne(
      {
        _id: { $in: memberRoles },
        name: 'owner',
        _destroy: false,
      },
      { _id: 1 }
    )
    .lean()

  if (ownerRole) {
    return true
  }

  // Check permission trong project_roles
  if (!permissionName) {
    return false
  }

  const permissionId = await getPermissionId(permissionName)
  const role = await projectRolesModel
    .findOne(
      {
        _id: { $in: memberRoles },
        permissions: permissionId,
        _destroy: false,
      },
      { _id: 1 }
    )
    .lean()

  if (!role) {
    return false
  }

  // Nếu permission là edit_permission_role, kiểm tra free_mode
  if (permissionName === 'edit_permission_role') {
    return project.free_mode
  }

  // Nếu permission không phải edit_permission_role và role có permission, pass
  return true
}

const softDelete = async (projectId, options = {}) => {
  const project = await projectModel.findById(projectId).session(options.session || null)
  if (!project || project._destroy) {
    return false
  }
  await projectModel.findByIdAndUpdate(
    projectId,
    {
      _destroy: true,
      deleted_at: new Date(),
    },
    options
  )
  return true
}

const updateFreeMode = async (projectId, freeModeValue, options = {}) => {
  const project = await projectModel.findById(projectId).session(options.session || null)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.free_mode = freeModeValue
  await project.save(options)
  return project
}

const addColumn = async (projectId, columnId, options = {}) => {
  const project = await projectModel.findById(projectId).session(options.session || null)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }

  project.columns = project.columns.filter(col => col.toString() !== columnId.toString())
  await project.save(options)
  return project
}

const removeColumn = async (projectId, columnId, options = {}) => {
  const project = await projectModel.findById(projectId).session(options.session || null)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.columns = project.columns.filter(col => col.toString() !== columnId.toString())
  await project.save(options)
  return project
}

const findById = async (id, options = {}) => {
  const project = await projectModel
    .findById(id)
    .session(options.session || null)
    .lean()
    .exec()
  if (!project || project._destroy) {
    return null
  }

  return project
}

export const projectRepository = {
  addColumn,
  removeColumn,
  createNew,
  findOneById,
  getAll,
  update,
  softDelete,
  addMember,
  removeMember,
  updateMemberRole,
  checkUserPermission,
  updateFreeMode,
  findById,
}
