import { projectValidation } from '~/validations/projectValidation'
import { projectService } from '~/services/projectService'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

/**
 * Kiểm tra xem người dùng đã xác thực chưa
 * @param {Object} req - Request chứa thông tin người dùng
 * @param {Object} res - Response trả về
 * @param {Function} next - Middleware tiếp theo
 * @throws {ApiError} Nếu không có thông tin người dùng
 */
const ensureAuthenticated = (req, res, next) => {
  if (!req.user?._id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED)
  }
  next()
}

/**
 * Kiểm tra quyền của người dùng đối với dự án
 * @param {string} requiredPermission - Quyền cần kiểm tra (can_edit, can_delete, can_add_member)
 * @returns {Function} Middleware kiểm tra quyền
 * @throws {ApiError} Nếu người dùng không có quyền
 */
const checkPermission = (requiredPermission) => async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id)
    if (!project.permissions[requiredPermission].includes(req.user._id)) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
    }
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Xác thực dữ liệu tạo dự án mới
 * @param {Object} req - Request chứa dữ liệu dự án
 * @param {Object} res - Response trả về
 * @param {Function} next - Middleware tiếp theo
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateCreate = async (req, res, next) => {
  try {
    await projectValidation.validateBeforeCreate(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

/**
 * Xác thực dữ liệu cập nhật dự án
 * @param {Object} req - Request chứa dữ liệu cập nhật
 * @param {Object} res - Response trả về
 * @param {Function} next - Middleware tiếp theo
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateUpdate = async (req, res, next) => {
  try {
    await projectValidation.validateUpdate(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

/**
 * Xác thực dữ liệu thêm thành viên vào dự án
 * @param {Object} req - Request chứa thông tin thành viên
 * @param {Object} res - Response trả về
 * @param {Function} next - Middleware tiếp theo
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateAddMember = async (req, res, next) => {
  try {
    await projectValidation.validateAddMember(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

/**
 * Xác thực dữ liệu cập nhật vai trò thành viên
 * @param {Object} req - Request chứa thông tin vai trò
 * @param {Object} res - Response trả về
 * @param {Function} next - Middleware tiếp theo
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateUpdateMemberRole = async (req, res, next) => {
  try {
    await projectValidation.validateUpdateMemberRole(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const projectMiddleware = {
  ensureAuthenticated,
  checkPermission,
  validateCreate,
  validateUpdate,
  validateAddMember,
  validateUpdateMemberRole,
}
