import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const TASK_COLLECTION_SCHEMA_JOI = Joi.object({
  title: Joi.string().required().trim().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.trim': 'Title must not have leading or trailing whitespace',
  }),
  description: Joi.string().allow(null).default(null),
  status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of [todo, in_progress, testing, completed]',
  }),
  priority: Joi.string().valid('low', 'medium', 'high').required().messages({
    'any.required': 'Priority is required',
    'any.only': 'Priority must be one of [low, medium, high]',
  }),
  project_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  due_date: Joi.date().allow(null).default(null),
  completed_at: Joi.date().allow(null).default(null),
  assignees: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      assigned_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      assigned_at: Joi.date().timestamp().default(Date.now),
    }),
  ).default([]),
  tags: Joi.array().items(Joi.string()).default([]),
  reminders: Joi.array().items(
    Joi.object({
      time: Joi.date().required(),
      type: Joi.string().valid('email', 'popup', 'push', 'sms').default('popup'),
      method: Joi.string().optional(),
      created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      created_at: Joi.date().timestamp().default(Date.now),
    }),
  ).default([]),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  title: Joi.string().required().trim().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.trim': 'Title must not have leading or trailing whitespace',
  }),
  description: Joi.string().allow(null).default(null),
  status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed').required(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  project_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
})

const validateBeforeCreate = async (data) => {
  try {
    return await TASK_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateCreate = async (data) => {
  const schema = Joi.object({
    title: Joi.string().required().trim().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
    }),
    description: Joi.string().allow(null, ''),
    project_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed').default('todo'),
    priority: Joi.string().valid('low', 'medium', 'high').required(),
    due_date: Joi.date().allow(null),
    tags: Joi.array().items(Joi.string()),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdate = async (data) => {
  const schema = Joi.object({
    title: Joi.string().trim(),
    description: Joi.string().allow(null, ''),
    priority: Joi.string().valid('low', 'medium', 'high'),
    due_date: Joi.date().allow(null),
    tags: Joi.array().items(Joi.string()),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateAssign = async (data) => {
  const schema = Joi.object({
    user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUnassign = async (data) => {
  const schema = Joi.object({
    user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateStatusUpdate = async (data) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('todo', 'in_progress', 'testing', 'completed')
      .required()
      .messages({
        'any.required': 'Status is required',
        'any.only': 'Status must be one of [todo, in_progress, testing, completed]',
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const taskValidation = {
  validateBeforeCreate,
  validateCreate,
  validateUpdate,
  validateAssign,
  validateUnassign,
  validateStatusUpdate,
}
