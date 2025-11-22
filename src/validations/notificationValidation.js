import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'

export const NOTIFICATION_COLLECTION_SCHEMA_JOI = Joi.object({
  user_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.USER_ID_INVALID,
    'any.required': MESSAGES.USER_ID_REQUIRED,
  }),
  type: Joi.string()
    .valid(
      'task_assigned',
      'task_due_soon',
      'task_completed',
      'project_invite',
      'mention',
      'message',
      'comment',
      'custom'
    )
    .required()
    .messages({
      'any.required': MESSAGES.NOTIFICATION_TYPE_REQUIRED,
      'string.empty': MESSAGES.NOTIFICATION_TYPE_EMPTY,
      'any.only': MESSAGES.NOTIFICATION_TYPE_INVALID,
    }),
  title: Joi.string().required().trim().messages({
    'any.required': MESSAGES.NOTIFICATION_TITLE_REQUIRED,
    'string.empty': MESSAGES.NOTIFICATION_TITLE_EMPTY,
    'string.trim': MESSAGES.NOTIFICATION_TITLE_TRIM,
  }),
  content: Joi.string().required().trim().messages({
    'any.required': MESSAGES.NOTIFICATION_CONTENT_REQUIRED,
    'string.empty': MESSAGES.NOTIFICATION_CONTENT_EMPTY,
    'string.trim': MESSAGES.NOTIFICATION_CONTENT_TRIM,
  }),
  link: Joi.string().uri().optional().allow(null),
  related_id: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .messages({
      'string.pattern.base': MESSAGES.OBJECT_ID_INVALID,
    })
    .optional(),
  read: Joi.boolean().default(false),
  scheduled_for: Joi.date().optional().allow(null),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  user_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.USER_ID_INVALID,
    'any.required': MESSAGES.USER_ID_REQUIRED,
  }),
  type: Joi.string()
    .valid(
      'task_assigned',
      'task_due_soon',
      'task_completed',
      'project_invite',
      'mention',
      'message',
      'comment',
      'custom'
    )
    .required(),
  title: Joi.string().required().trim(),
  content: Joi.string().required().trim(),
  link: Joi.string().uri().optional().allow(null),
  related_id: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .messages({
      'string.pattern.base': MESSAGES.OBJECT_ID_INVALID,
    })
    .optional(),
})

const validateBeforeCreate = async data => {
  try {
    return await NOTIFICATION_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const notificationValidation = {
  NOTIFICATION_COLLECTION_SCHEMA_JOI,
  CREATE_NEW_SCHEMA,
  validateBeforeCreate,
}
