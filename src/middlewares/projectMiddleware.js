import { projectValidation } from '~/validations/projectValidation'
import { ApiError } from '~/utils/APIError'
import { StatusCodes } from 'http-status-codes'

const validateCreate = async (req, res, next) => {
  try {
    await projectValidation.validateCreate(req.body)
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

export const projectMiddleware = {
  validateCreate,
  validateUpdate,
  validateAddMember,
  validateUpdateMemberRole,
}
