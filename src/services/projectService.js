import { projectRepository } from '~/repository/projectRepository'
import { projectRolesModel } from '~/models/projectRolesModel'
import { authModel } from '~/models/authModel'
import { projectValidation } from '~/validations/projectValidation'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'
import { defaultRolesModel } from '~/models/defaultRolesModel'
import { permissionModel } from '~/models/permissionModel'

/**
 * Hàm phụ để lấy ObjectId của permission dựa trên tên
 * @param {string} permissionName - Tên của permission
 * @returns {string} ObjectId của permission
 * @throws {ApiError} Nếu permission không tồn tại
 */
const getPermissionId = async (permissionName) => {
  const permission = await permissionModel.findOne({ name: permissionName, _destroy: false }).lean()
  if (!permission) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Quyền ${permissionName} không tồn tại`)
  }
  return permission._id.toString()
}

/**
 * Tạo một dự án mới
 * @param {Object} data - Dữ liệu dự án
 * @returns {Object} Dự án đã được tạo
 * @throws {ApiError} Nếu không có created_by hoặc lỗi server
 */
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

/**
 * Lấy danh sách dự án của người dùng
 * @param {string} userId - ID của người dùng
 * @param {Object} [options={}] - Tùy chọn truy vấn (page, limit, sortBy, order, status, priority)
 * @returns {Array} Danh sách dự án
 * @throws {ApiError} Nếu không tìm thấy dự án
 */
const getAll = async (userId, { page = 1, limit = 10, sortBy = 'created_at', order = 'desc', status, priority } = {}) => {
  const filter = {
    $or: [{ 'members.user_id': userId }, { created_by: userId }],
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

/**
 * Lấy thông tin dự án theo ID
 * @param {string} projectId - ID của dự án
 * @returns {Object} Thông tin dự án
 * @throws {ApiError} Nếu dự án không tồn tại
 */
const getProjectById = async (projectId) => {
  return await projectRepository.findOneById(projectId)
}

/**
 * Thêm thành viên vào dự án, luôn gán vai trò member
 * @param {string} projectId - ID của dự án
 * @param {Object} memberData - Thông tin thành viên (user_id)
 * @param {string} userId - ID của người dùng yêu cầu
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền, hoặc thành viên không hợp lệ
 */
const addProjectMember = async (projectId, memberData, userId) => {
  const project = await projectRepository.findOneById(projectId)
  const member = project.members.find(m => m.user_id.toString() === userId.toString())
  if (!member) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không phải thành viên của dự án')
  }
  const role = await projectRolesModel.findById(member.project_role_id).lean()
  const addMemberPermissionId = await getPermissionId('add_member')
  if (!role.permissions.includes(addMemberPermissionId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  }

  // Xác thực dữ liệu đầu vào
  const validatedData = await projectValidation.validateAddMember(memberData)

  // Kiểm tra xem user_id đã tồn tại trong dự án chưa
  if (project.members.some(m => m.user_id.toString() === memberData.user_id.toString())) {
    throw new ApiError(StatusCodes.CONFLICT, 'Thành viên đã tồn tại trong dự án')
  }

  // Kiểm tra xem user_id có tồn tại trong hệ thống
  const userExists = await authModel.findById(memberData.user_id)
  if (!userExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }

  // Tìm vai trò member trong ProjectRoles
  const memberRole = await projectRolesModel.findOne({
    project_id: projectId,
    name: 'member',
  })
  if (!memberRole) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy vai trò member cho dự án')
  }

  return await projectRepository.addMember(projectId, {
    user_id: memberData.user_id,
    project_role_id: memberRole._id,
    joined_at: new Date(),
  })
}

/**
 * Xóa thành viên khỏi dự án
 * @param {string} projectId - ID của dự án
 * @param {string} userId - ID của thành viên cần xóa
 * @param {string} requesterId - ID của người dùng yêu cầu
 * @returns {boolean} Trả về true nếu xóa thành công
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền hoặc thành viên không tồn tại
 */
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

/**
 * Cập nhật vai trò của thành viên trong dự án
 * @param {string} projectId - ID của dự án
 * @param {Object} roleData - Thông tin vai trò (user_id, role_name: lead hoặc member)
 * @param {string} requesterId - ID của người dùng yêu cầu
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền, thành viên hoặc vai trò không tồn tại
 */
const updateProjectMemberRole = async (projectId, roleData, requesterId) => {
  const project = await projectRepository.findOneById(projectId)
  const requester = project.members.find(m => m.user_id.toString() === requesterId.toString())
  if (!requester) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không phải thành viên của dự án')
  }
  const requesterRole = await projectRolesModel.findById(requester.project_role_id).lean()
  const changeMemberRolePermissionId = await getPermissionId('lead_change_member_role')
  if (!requesterRole.permissions.includes(changeMemberRolePermissionId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  }

  // Xác thực dữ liệu đầu vào
  const validatedData = await projectValidation.validateUpdateMemberRole(roleData)

  // Kiểm tra xem user_id có trong dự án không
  const targetMember = project.members.find(m => m.user_id.toString() === roleData.user_id.toString())
  if (!targetMember) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Thành viên không tồn tại trong dự án')
  }

  // Tìm vai trò được yêu cầu trong ProjectRoles
  const newRole = await projectRolesModel.findOne({
    project_id: projectId,
    name: roleData.role_name,
  })
  if (!newRole) {
    throw new ApiError(StatusCodes.NOT_FOUND, `Vai trò ${roleData.role_name} không tồn tại trong dự án`)
  }

  // Nếu gán vai trò lead, kiểm tra và gỡ lead hiện tại
  if (roleData.role_name === 'lead') {
    const currentLead = await Promise.resolve(project.members.find(async m => {
      const role = await projectRolesModel.findById(m.project_role_id).lean()
      return role.name === 'lead' && m.user_id.toString() !== roleData.user_id.toString()
    }))
    if (currentLead) {
      const memberRole = await projectRolesModel.findOne({
        project_id: projectId,
        name: 'member',
      })
      if (!memberRole) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy vai trò member cho dự án')
      }
      // Gỡ vai trò lead, chuyển về member
      await projectRepository.updateMemberRole(projectId, currentLead.user_id, memberRole._id)
    }
  }

  return await projectRepository.updateMemberRole(projectId, roleData.user_id, newRole._id)
}

/**
 * Lấy danh sách vai trò của dự án
 * @param {string} projectId - ID của dự án
 * @returns {Array} Danh sách vai trò
 * @throws {ApiError} Nếu dự án không tồn tại
 */
const getProjectRoles = async (projectId) => {
  const project = await projectRepository.findOneById(projectId)
  return await projectRolesModel.find({ project_id: projectId }).lean()
}

/**
 * Lấy thông tin lead của dự án
 * @param {string} projectId - ID của dự án
 * @returns {Object|null} Thông tin lead (nếu có)
 * @throws {ApiError} Nếu dự án không tồn tại
 */
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

/**
 * Cập nhật thông tin dự án
 * @param {string} projectId - ID của dự án
 * @param {Object} updateData - Dữ liệu cần cập nhật
 * @param {string} userId - ID của người dùng yêu cầu
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền hoặc dữ liệu không hợp lệ
 */
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
}
