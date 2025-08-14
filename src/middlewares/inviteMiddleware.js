import { inviteValidate } from '~/validations/inviteValidation'
// import { projectRolesModel } from '~/models/projectRolesModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const validateCreate = async (req, res, next) => {
  try {
    await inviteValidate.validateCreateInvite(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateParams = async (req, res, next) => {
  try {
    await inviteValidate.validateParams(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const inviteMiddleware = {
  validateCreate,
  validateParams,
}
