import { projectValidation } from '~/validations/projectValidation'
import { projectService } from '~/services/projectService'
// import { projectRolesModel } from '~/models/projectRolesModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

const checkProjectPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params
      const userId = req.user?._id // an toàn hơn với optional chaining
      // Kiểm tra từng giá trị
      if (!projectId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.PROJECT_ID_NOT_FOUND)
      }
      if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.USERID_NOT_FOUND)
      }
      if (!permissionName) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, MESSAGES.PERMISSION_NAME_NOT_FOUND)
      }
      const hasPermission = await projectService.verifyProjectPermission(
        projectId,
        userId,
        permissionName,
      )
      if (!hasPermission) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện thao tác này')
      }
      next()
    } catch (error) {
      next(error)
    }
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
  checkProjectPermission,
  validateCreate,
  validateUpdate,
  validateAddMember,
  validateUpdateMemberRole,
}
