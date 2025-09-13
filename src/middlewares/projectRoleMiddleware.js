import { projectRoleValidation } from '~/validations/projectRolesValidation'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { projectService } from '~/services/projectService'

const checkProjectPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id
      const projectId = req.params.projectId

      const hasPermission = await projectService.verifyProjectPermission(projectId, userId, permission)
      console.log('✅ [checkProjectPermission] hasPermission:', hasPermission)

      if (!hasPermission) {
        return next(new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền thực hiện hành động này'))
      }

      next()
    } catch (error) {
      next(error) // đẩy lỗi sang error middleware toàn cục
    }
  }
}


const validateAddPermission = async (req, res, next) => {
  try {
    await projectRoleValidation.validateAddPermission(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateRemovePermission = async (req, res, next) => {
  try {
    await projectRoleValidation.validateRemovePermission(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateGetPermissions = async (req, res, next) => {
  try {
    await projectRoleValidation.validateGetPermissions(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateUpdate = async (req, res, next) => {
  try {
    await projectRoleValidation.validateUpdate(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateAssignRole = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params
    const { roleId } = req.body
    await projectRoleValidation.validateAssignRole({ projectId, memberId, roleId })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message))
  }
}

export const projectRoleMiddleware = {
  checkProjectPermission,
  validateAddPermission,
  validateRemovePermission,
  validateGetPermissions,
  validateUpdate,
  validateAssignRole,
}
