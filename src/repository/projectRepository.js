import { projectModel } from '~/models/projectModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

/**
 * Tạo một dự án mới trong cơ sở dữ liệu
 * @param {Object} data - Dữ liệu dự án
 * @returns {Object} Dự án đã được tạo
 * @throws {Error} Nếu lỗi xảy ra khi tạo dự án
 */
const createNew = async (data) => {
  return await projectModel.create(data)
}

/**
 * Lấy thông tin dự án theo ID
 * @param {string} id - ID của dự án
 * @returns {Object} Thông tin dự án với dữ liệu liên quan được populate
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const findOneById = async (id) => {
  const project = await projectModel
    .findById(id)
    .lean()
    .populate('created_by', 'name email')
    .populate('team_lead', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.role_id', 'name')
    .exec()
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  return project
}

/**
 * Lấy danh sách dự án theo bộ lọc
 * @param {Object} [filter={ _destroy: false }] - Bộ lọc truy vấn
 * @param {Object} [sort={ created_at: -1 }] - Tiêu chí sắp xếp
 * @param {Object} [options={}] - Tùy chọn truy vấn (phân trang, giới hạn, v.v.)
 * @returns {Array} Danh sách dự án với dữ liệu liên quan được populate
 * @throws {ApiError} Nếu bộ lọc không hợp lệ
 */
const getAll = async (filter = { _destroy: false }, sort = { created_at: -1 }, options = {}) => {
  if (!filter || typeof filter !== 'object') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bộ lọc không hợp lệ')
  }
  return await projectModel
    .find(filter)
    .sort(sort)
    .setOptions(options)
    .lean()
    .populate('created_by', 'name email')
    .populate('team_lead', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.role_id', 'name')
    .exec()
}

/**
 * Cập nhật thông tin dự án
 * @param {string} projectId - ID của dự án
 * @param {Object} updateData - Dữ liệu cần cập nhật
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const update = async (projectId, updateData) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  return await projectModel
    .findByIdAndUpdate(projectId, updateData, { new: true })
    .populate('created_by', 'name email')
    .populate('team_lead', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.role_id', 'name')
    .exec()
}

/**
 * Xóa mềm dự án
 * @param {string} projectId - ID của dự án
 * @returns {boolean} Trả về true nếu xóa thành công
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const softDelete = async (projectId) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  await projectModel.findByIdAndUpdate(projectId, { _destroy: true })
  return true
}

/**
 * Thêm thành viên vào dự án
 * @param {string} projectId - ID của dự án
 * @param {Object} memberData - Thông tin thành viên (user_id, role_id, joined_at)
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const addMember = async (projectId, memberData) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.members.push(memberData)
  project.member_count = project.members.length
  return await project
    .save()
    .then(doc => doc.populate('created_by', 'name email')
      .populate('team_lead', 'name email')
      .populate('members.user_id', 'name email')
      .populate('members.role_id', 'name')
      .execPopulate())
}

/**
 * Xóa thành viên khỏi dự án
 * @param {string} projectId - ID của dự án
 * @param {string} userId - ID của thành viên cần xóa
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại hoặc đã bị xóa mềm
 */
const removeMember = async (projectId, userId) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  project.members = project.members.filter(member => member.user_id.toString() !== userId)
  project.member_count = project.members.length
  return await project
    .save()
    .then(doc => doc.populate('created_by', 'name email')
      .populate('team_lead', 'name email')
      .populate('members.user_id', 'name email')
      .populate('members.role_id', 'name')
      .execPopulate())
}

/**
 * Cập nhật vai trò của thành viên trong dự án
 * @param {string} projectId - ID của dự án
 * @param {string} userId - ID của thành viên
 * @param {string} roleId - ID của vai trò mới
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, đã bị xóa mềm hoặc thành viên không tồn tại
 */
const updateMemberRole = async (projectId, userId, roleId) => {
  const project = await projectModel.findById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }
  const updatedProject = await projectModel
    .findOneAndUpdate(
      { _id: projectId, 'members.user_id': userId },
      { $set: { 'members.$.role_id': roleId } },
      { new: true },
    )
    .populate('created_by', 'name email')
    .populate('team_lead', 'name email')
    .populate('members.user_id', 'name email')
    .populate('members.role_id', 'name')
    .exec()
  if (!updatedProject) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_MEMBER)
  }
  return updatedProject
}

export const projectRepository = {
  createNew,
  findOneById,
  getAll,
  update,
  softDelete,
  addMember,
  removeMember,
  updateMemberRole,
}
