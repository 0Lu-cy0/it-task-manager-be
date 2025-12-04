import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'

const validate = (schema, payload) => {
  const { value, error } = schema.validate(payload, { abortEarly: false, convert: true })
  if (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
  return value
}

const projectParamsSchema = Joi.object({
  projectId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.PROJECT_ID_INVALID,
    'any.required': MESSAGES.PROJECT_ID_REQUIRED,
  }),
})

const summaryQuerySchema = Joi.object({
  rangeDays: Joi.number().integer().min(1).max(90).default(7).messages({
    'number.base': 'rangeDays phải là số',
    'number.min': 'rangeDays phải lớn hơn hoặc bằng 1',
    'number.max': 'rangeDays không được vượt quá 90',
  }),
  dueInDays: Joi.number().integer().min(1).max(90).default(7).messages({
    'number.base': 'dueInDays phải là số',
    'number.min': 'dueInDays phải lớn hơn hoặc bằng 1',
    'number.max': 'dueInDays không được vượt quá 90',
  }),
  typeLimit: Joi.number().integer().min(1).max(10).default(4).messages({
    'number.base': 'typeLimit phải là số',
    'number.min': 'typeLimit phải lớn hơn hoặc bằng 1',
    'number.max': 'typeLimit không được vượt quá 10',
  }),
})

const workloadQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'limit phải là số',
    'number.min': 'limit phải lớn hơn hoặc bằng 1',
    'number.max': 'limit không được vượt quá 100',
  }),
})

const activityQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(200).default(20).messages({
    'number.base': 'limit phải là số',
    'number.min': 'limit phải lớn hơn hoặc bằng 1',
    'number.max': 'limit không được vượt quá 200',
  }),
})

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
