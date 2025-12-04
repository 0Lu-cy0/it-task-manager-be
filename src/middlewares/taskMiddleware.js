import { taskValidation } from '~/validations/taskValidation'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const normalizeTaskPayload = payload => {
  if (!payload || typeof payload !== 'object') return payload

  if (payload.name && !payload.title) {
    payload.title = payload.name
  }
  delete payload.name

  if (typeof payload.status === 'string') {
    payload.status = payload.status.toLowerCase()
  }

  if (payload.dueDate && !payload.due_date) {
    payload.due_date = payload.dueDate
  }
  delete payload.dueDate

  return payload
}

const validateCreate = async (req, res, next) => {
  try {
    req.body.created_by = req.user._id
    req.body.project_id = req.params.projectId
    normalizeTaskPayload(req.body)
    await taskValidation.validateCreate(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateUpdate = async (req, res, next) => {
  try {
    normalizeTaskPayload(req.body)
    await taskValidation.validateUpdate(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateAssign = async (req, res, next) => {
  try {
    await taskValidation.validateAssign(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateUnassign = async (req, res, next) => {
  try {
    await taskValidation.validateUnassign(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateStatusUpdate = async (req, res, next) => {
  try {
    await taskValidation.validateStatusUpdate(req.body)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const taskMiddleware = {
  validateCreate,
  validateUpdate,
  validateAssign,
  validateUnassign,
  validateStatusUpdate,
}
