import { StatusCodes } from 'http-status-codes'
import { projectService } from '~/services/projectService'
import { MESSAGES } from '~/constants/messages'
import winston from 'winston'

const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: 'project.log' })],
})

/**
 * Tạo một dự án mới
 * @param {Object} req - Request chứa dữ liệu dự án
 * @param {Object} res - Response trả về kết quả
 * @param {Function} next - Middleware xử lý lỗi
 * @returns {Object} Dự án đã được tạo
 * @throws {ApiError} Nếu dữ liệu không hợp lệ hoặc lỗi server
 */
const createNew = async (req, res, next) => {
  try {
    const result = await projectService.createNew({
      ...req.body,
      created_by: req.user._id,
    })
    logger.info(`Dự án mới được tạo bởi ${req.user._id}: ${result._id}`)
    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: MESSAGES.PROJECT_CREATED,
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi tạo dự án: ${error.message}`)
    next(error)
  }
}

/**
 * Cập nhật thông tin dự án
 * @param {Object} req - Request chứa ID dự án và dữ liệu cập nhật
 * @param {Object} res - Response trả về kết quả
 * @param {Function} next - Middleware xử lý lỗi
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền hoặc dữ liệu không hợp lệ
 */
const update = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const result = await projectService.updateProject(projectId, req.body)
    logger.info(`Dự án ${projectId} được cập nhật bởi ${req.user._id}`)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: MESSAGES.PROJECT_UPDATED,
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi cập nhật dự án ${req.params.projectId}: ${error.message}`)
    next(error)
  }
}

/**
 * Xóa mềm dự án
 * @param {Object} req - Request chứa ID dự án
 * @param {Object} res - Response trả về kết quả
 * @param {Function} next - Middleware xử lý lỗi
 * @throws {ApiError} Nếu dự án không tồn tại hoặc không có quyền
 * @route DELETE /api/projects/:projectId
 * @access Private (cần có quyền delete_project)
 */
const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const deleted = projectService.deleteProject(projectId)
    if (deleted) {
      res.status(StatusCodes.NOT_FOUND).json({
        status: 'error',
        message: MESSAGES.PROJECT_NOT_FOUND,
      })
    }
    else {
      res.status(StatusCodes.OK).json({
        status: 'success',
        message: MESSAGES.PROJECT_DELETED,
      })
    }
  } catch (error) {
    logger.error(`Lỗi khi xóa dự án ${req.params.projectId}: ${error.message}`)
    next(error)
  }
}

/**
 * Lấy tất cả dự án của người dùng
 * @param {Object} req - Request chứa thông tin người dùng và query
 * @param {Object} res - Response trả về danh sách dự án
 * @param {Function} next - Middleware xử lý lỗi
 * @returns {Array} Danh sách dự án
 * @throws {ApiError} Nếu không tìm thấy dự án hoặc lỗi server
 */
const getAllProjects = async (req, res, next) => {
  try {
    const result = await projectService.getAll(req.user._id, req.query)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Danh sách dự án được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy danh sách dự án: ${error.message}`)
    next(error)
  }
}

/**
 * Lấy thông tin dự án theo ID
 * @param {Object} req - Request chứa ID dự án
 * @param {Object} res - Response trả về thông tin dự án
 * @param {Function} next - Middleware xử lý lỗi
 * @returns {Object} Thông tin dự án
 * @throws {ApiError} Nếu dự án không tồn tại
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.getProjectById(id)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Dự án được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

/**
 * Thêm thành viên vào dự án
 * @param {Object} req - Request chứa ID dự án và thông tin thành viên
 * @param {Object} res - Response trả về kết quả
 * @param {Function} next - Middleware xử lý lỗi
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền hoặc thành viên đã tồn tại
 */
const addMember = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.addProjectMember(id, req.body, req.user._id)
    logger.info(`Thêm thành viên vào dự án ${id} bởi ${req.user._id}`)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Thêm thành viên thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi thêm thành viên vào dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

/**
 * Xóa thành viên khỏi dự án
 * @param {Object} req - Request chứa ID dự án và ID người dùng
 * @param {Object} res - Response trả về kết quả
 * @param {Function} next - Middleware xử lý lỗi
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền hoặc thành viên không tồn tại
 */
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params
    await projectService.removeProjectMember(id, userId, req.user._id)
    logger.info(`Xóa thành viên ${userId} khỏi dự án ${id} bởi ${req.user._id}`)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Xóa thành viên thành công',
    })
  } catch (error) {
    logger.error(`Lỗi khi xóa thành viên ${req.params.userId} khỏi dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

/**
 * Cập nhật vai trò của thành viên trong dự án
 * @param {Object} req - Request chứa ID dự án, ID người dùng và vai trò mới
 * @param {Object} res - Response trả về kết quả
 * @param {Function} next - Middleware xử lý lỗi
 * @returns {Object} Dự án đã được cập nhật
 * @throws {ApiError} Nếu dự án không tồn tại, không có quyền hoặc vai trò không hợp lệ
 */
const updateMemberRole = async (req, res, next) => {
  try {
    const { id, userId } = req.params
    const roleData = { user_id: userId, role_name: req.body.role_name }
    const result = await projectService.updateProjectMemberRole(id, roleData, req.user._id)
    logger.info(`Cập nhật vai trò thành viên ${userId} trong dự án ${id} bởi ${req.user._id}`)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Cập nhật vai trò thành viên thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi cập nhật vai trò thành viên ${req.params.userId} trong dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

/**
 * Lấy danh sách vai trò của dự án
 * @param {Object} req - Request chứa ID dự án
 * @param {Object} res - Response trả về danh sách vai trò
 * @param {Function} next - Middleware xử lý lỗi
 * @returns {Array} Danh sách vai trò
 * @throws {ApiError} Nếu dự án không tồn tại
 */
const getProjectRoles = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.getProjectRoles(id)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Danh sách vai trò được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy danh sách vai trò của dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

/**
 * Lấy thông tin lead của dự án
 * @param {Object} req - Request chứa ID dự án
 * @param {Object} res - Response trả về thông tin lead
 * @param {Function} next - Middleware xử lý lỗi
 * @returns {Object|null} Thông tin lead
 * @throws {ApiError} Nếu dự án không tồn tại
 */
const getProjectLead = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.getProjectLead(id)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Thông tin lead được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy thông tin lead của dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

export const projectController = {
  createNew,
  update,
  deleteProject,
  getAllProjects,
  getById,
  addMember,
  removeMember,
  updateMemberRole,
  getProjectRoles,
  getProjectLead,
}
