import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'

const projectParamsSchema = Joi.object({
  projectId: Joi.string().pattern(OBJECT_ID_RULE).required().messages({
    'any.required': MESSAGES.PROJECT_ID_REQUIRED,
    'string.pattern.base': MESSAGES.PROJECT_ID_INVALID,
  }),
})

const summaryQuerySchema = Joi.object({
  rangeDays: Joi.number().integer().min(1).max(90).default(7),
  dueInDays: Joi.number().integer().min(1).max(90).default(7),
  typeLimit: Joi.number().integer().min(1).max(20).default(4),
})

const workloadQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
})

const activityQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
})

const validate = (schema, payload) => {
  const { error, value } = schema.validate(payload)
  if (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, error.message)
  }
  return value
}

const validateProjectParams = params => validate(projectParamsSchema, params)
const validateSummaryQuery = query => validate(summaryQuerySchema, query)
const validateWorkloadQuery = query => validate(workloadQuerySchema, query)
const validateActivityQuery = query => validate(activityQuerySchema, query)

export const dashboardValidation = {
  validateProjectParams,
  validateSummaryQuery,
  validateWorkloadQuery,
  validateActivityQuery,
}
