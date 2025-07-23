import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const PROJECT_COLLECTION_SCHEMA_JOI = Joi.object({
  name: Joi.string().required().min(5).max(50).trim().strict().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.min': 'Title min 5 chars',
    'string.max': 'Title max 50 chars',
    'string.trim': 'Title must not have leading or trailing whitespace',
  }),
  description: Joi.string().allow(null).default(null),
  status: Joi.string().valid('planning', 'in_progress', 'testing', 'completed').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of [planning, in_progress, testing, completed]',
  }),
  priority: Joi.string().valid('low', 'medium', 'high').required().messages({
    'any.required': 'Priority is required',
    'any.only': 'Priority must be one of [low, medium, high]',
  }),
  progress: Joi.number().min(0).max(100).default(0),
  start_date: Joi.date().allow(null).default(null),
  end_date: Joi.date().allow(null).default(null),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  team_lead: Joi.string().allow(null).pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  deputy_lead: Joi.string().allow(null).pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      joined_at: Joi.date().default(Date.now),
    }),
  ).default([]),
  permissions: Joi.object({
    can_edit: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    can_delete: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    can_add_member: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  }).default(),
  member_count: Joi.number().default(0),
  created_at: Joi.date().default(Date.now),
  updated_at: Joi.date().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

const CREATE_NEW_SCHEMA = Joi.object({
  name: Joi.string().required().min(5).trim().strict().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.min': 'Title min 5 chars',
    'string.trim': 'Title must not have leading or trailing whitespace',
  }),
  description: Joi.string().allow(null).default(null),
  status: Joi.string().valid('planning', 'in_progress', 'testing', 'completed').required(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
})

const validateBeforeCreate = async (data) => {
  try {
    return await PROJECT_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdate = async (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).trim(),
    description: Joi.string().allow(null, ''),
    status: Joi.string().valid('planning', 'in_progress', 'testing', 'completed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    start_date: Joi.date().allow(null),
    end_date: Joi.date().allow(null)
      .greater(Joi.ref('start_date'))
      .messages({
        'date.greater': 'End date must be after start date',
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateAddMember = async (data) => {
  const schema = Joi.object({
    user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdateMemberRole = async (data) => {
  const schema = Joi.object({
    role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const projectValidation = {
  validateBeforeCreate,
  validateUpdate,
  validateAddMember,
  validateUpdateMemberRole,
}
