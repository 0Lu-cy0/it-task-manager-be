import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'

export const TASK_COLLECTION_SCHEMA_JOI = Joi.object({
  title: Joi.string().required().trim().messages({
    'any.required': MESSAGES.TASK_TITLE_REQUIRED,
    'string.empty': MESSAGES.TASK_TITLE_EMPTY,
    'string.trim': MESSAGES.TASK_TITLE_TRIM,
  }),
  description: Joi.string().allow(null).default(null),
  status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed').required().messages({
    'any.required': MESSAGES.TASK_STATUS_REQUIRED,
    'any.only': MESSAGES.TASK_STATUS_INVALID,
  }),
  priority: Joi.string().valid('low', 'medium', 'high').required().messages({
    'any.required': MESSAGES.TASK_PRIORITY_REQUIRED,
    'any.only': MESSAGES.TASK_PRIORITY_INVALID,
  }),
  type: Joi.string()
    .valid('task', 'story', 'bug', 'subtask', 'asset', 'epic', 'research', 'other')
    .default('task')
    .messages({
      'any.only': MESSAGES.TASK_TYPE_INVALID,
    }),
  project_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.PROJECT_ID_INVALID,
    'any.required': MESSAGES.PROJECT_ID_REQUIRED,
  }),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.USER_ID_INVALID,
    'any.required': MESSAGES.USER_ID_REQUIRED,
  }),
  columnId: Joi.string().allow(null, ''),
  due_date: Joi.date().allow(null, ''),
  completed_at: Joi.date().allow(null).default(null),
  assignees: Joi.array()
    .items(
      Joi.object({
        user_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
          'string.pattern.base': MESSAGES.USER_ID_INVALID,
          'any.required': MESSAGES.USER_ID_REQUIRED,
        }),
        role_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
          'string.pattern.base': MESSAGES.ROLE_ID_INVALID,
          'any.required': MESSAGES.ROLE_ID_REQUIRED,
        }),
        assigned_by: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
          'string.pattern.base': MESSAGES.USER_ID_INVALID,
          'any.required': MESSAGES.USER_ID_REQUIRED,
        }),
        assigned_at: Joi.date().timestamp().default(Date.now),
      })
    )
    .default([]),
  tags: Joi.array().items(Joi.string()).default([]),
  reminders: Joi.array()
    .items(
      Joi.object({
        time: Joi.date().required(),
        type: Joi.string().valid('email', 'popup', 'push', 'sms').default('popup'),
        method: Joi.string().optional(),
        created_by: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
          'string.pattern.base': MESSAGES.USER_ID_INVALID,
          'any.required': MESSAGES.USER_ID_REQUIRED,
        }),
        created_at: Joi.date().timestamp().default(Date.now),
      })
    )
    .default([]),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  title: Joi.string().required().trim().messages({
    'any.required': MESSAGES.TASK_TITLE_REQUIRED,
    'string.empty': MESSAGES.TASK_TITLE_EMPTY,
    'string.trim': MESSAGES.TASK_TITLE_TRIM,
  }),
  description: Joi.string().allow(null).default(null),
  status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed').required(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  type: Joi.string().valid('task', 'story', 'bug', 'subtask', 'asset', 'epic', 'research', 'other')
    .default('task'),
  project_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.PROJECT_ID_INVALID,
    'any.required': MESSAGES.PROJECT_ID_REQUIRED,
  }),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.USER_ID_INVALID,
    'any.required': MESSAGES.USER_ID_REQUIRED,
  }),
})

const validateBeforeCreate = async data => {
  try {
    return await TASK_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateCreate = async data => {
  const schema = Joi.object({
    title: Joi.string().required().trim().messages({
      'any.required': MESSAGES.TASK_TITLE_REQUIRED,
      'string.empty': MESSAGES.TASK_TITLE_EMPTY,
    }),
    description: Joi.string().allow(null, ''),
    project_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
      'string.pattern.base': MESSAGES.PROJECT_ID_INVALID,
      'any.required': MESSAGES.PROJECT_ID_REQUIRED,
    }),
    created_by: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
      'string.pattern.base': MESSAGES.USER_ID_INVALID,
      'any.required': MESSAGES.USER_ID_REQUIRED,
    }),
    status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed').default('todo'),
    priority: Joi.string().valid('low', 'medium', 'high').required(),
    type: Joi.string()
      .valid('task', 'story', 'bug', 'subtask', 'asset', 'epic', 'research', 'other')
      .default('task'),
    due_date: Joi.date().allow(null),
    tags: Joi.array().items(Joi.string()),
    columnId: Joi.string().allow(null, ''),
    dueDate: Joi.date().allow(null),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdate = async data => {
  const schema = Joi.object({
    title: Joi.string().trim(),
    description: Joi.string().allow(null, ''),
    priority: Joi.string().valid('low', 'medium', 'high'),
    type: Joi.string().valid('task', 'story', 'bug', 'subtask', 'asset', 'epic', 'research', 'other'),
    due_date: Joi.date().allow(null),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed')
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateAssign = async data => {
  const schema = Joi.object({
    user_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
      'string.pattern.base': MESSAGES.USER_ID_INVALID,
      'any.required': MESSAGES.USER_ID_REQUIRED,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUnassign = async data => {
  const schema = Joi.object({
    user_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
      'string.pattern.base': MESSAGES.USER_ID_INVALID,
      'any.required': MESSAGES.USER_ID_REQUIRED,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateStatusUpdate = async data => {
  const schema = Joi.object({
    status: Joi.string().valid('todo', 'in_progress', 'testing', 'completed').required().messages({
      'any.required': MESSAGES.TASK_STATUS_REQUIRED,
      'any.only': MESSAGES.TASK_STATUS_INVALID,
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

