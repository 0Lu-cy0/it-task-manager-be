import { projectValidation } from '~/validations/projectValidation'
import { projectService } from '~/services/projectService'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'
import { projectModel } from '~/models/projectModel'
import { projectRolesModel } from '~/models/projectRolesModel'

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

const validateCreate = async (req, res, next) => {
  try {
    req.body.created_by = req.user._id
    await projectValidation.validateBeforeCreate(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateUpdate = async (req, res, next) => {
  try {
    await projectValidation.validateUpdate(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateAddMember = async (req, res, next) => {
  try {
    await projectValidation.validateAddMember(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateUpdateMemberRole = async (req, res, next) => {
  try {
    await projectValidation.validateUpdateMemberRole(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const checkIsOwner = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const currentUserId = req.user._id
    const project = await projectModel.findById(projectId)
    if (!project || project._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Project không tồn tại')
    }
    const member = project.members.find((m) => m.user_id.toString() === currentUserId.toString())
    if (!member) throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không thuộc project này')
    const ownerRole = await projectRolesModel.findOne({
      _id: member.project_role_id,
      name: 'owner',
      project_id: projectId,
    })
    if (!ownerRole) throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ owner mới được phép thao tác')
    next()
  } catch (error) {
    next(error)
  }
}

export const projectMiddleware = {
  checkProjectPermission,
  validateCreate,
  validateUpdate,
  validateAddMember,
  validateUpdateMemberRole,
  checkIsOwner,
}
