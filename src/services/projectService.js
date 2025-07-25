import mongoose from 'mongoose'
import { projectRepository } from '~/repository/projectRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

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
  return await projectRepository.createNew(data)
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
 * Cập nhật thông tin dự án
 * @param {string} projectId - ID của dự án
 * @param {Object} updateData - Dữ liệu cần cập nhật
 * @param {string} userId - ID của người dùng yêu cầu
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền hoặc dữ liệu không hợp lệ
 */
const updateProject = async (projectId, updateData, userId) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project.permissions.can_edit.includes(userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  }
  return await projectRepository.update(projectId, updateData)
}

/**
 * Xóa mềm dự án
 * @param {string} projectId - ID của dự án
 * @param {string} userId - ID của người dùng yêu cầu
 * @returns {boolean} Trả về true nếu xóa thành công
 * @throws {ApiError} Nếu dự án không tồn tại hoặc không có quyền
 */
const deleteProject = async (projectId, userId) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project.permissions.can_delete.includes(userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  }
  return await projectRepository.softDelete(projectId)
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
 * Thêm thành viên vào dự án
 * @param {string} projectId - ID của dự án
 * @param {Object} memberData - Thông tin thành viên (user_id, role_id)
 * @param {string} userId - ID của người dùng yêu cầu
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền, hoặc thành viên không hợp lệ
 */
const addProjectMember = async (projectId, memberData, userId) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project.permissions.can_add_member.includes(userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  }
  const user = await mongoose.model('users').findById(memberData.user_id)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  const role = await mongoose.model('roles').findById(memberData.role_id)
  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND)
  }
  return await projectRepository.addMember(projectId, {
    ...memberData,
    joined_at: Date.now(),
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
  if (!project.permissions.can_add_member.includes(requesterId)) {
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
 * @param {string} userId - ID của thành viên
 * @param {string} roleId - ID của vai trò mới
 * @param {string} requesterId - ID của người dùng yêu cầu
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền, thành viên hoặc vai trò không tồn tại
 */
const updateProjectMemberRole = async (projectId, userId, roleId, requesterId) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project.permissions.can_add_member.includes(requesterId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  }
  const role = await mongoose.model('roles').findById(roleId)
  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND)
  }
  return await projectRepository.updateMemberRole(projectId, userId, roleId)
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
}
