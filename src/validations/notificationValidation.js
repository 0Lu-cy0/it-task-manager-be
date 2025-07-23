import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const NOTIFICATION_COLLECTION_SCHEMA_JOI = Joi.object({
  user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string()
    .valid('task_assigned', 'task_due_soon', 'task_completed', 'project_invite', 'mention', 'message', 'comment', 'custom')
    .required()
    .messages({
      'any.required': 'Type is required',
      'string.empty': 'Type is not allowed to be empty',
      'any.only': 'Type must be one of [task_assigned, task_due_soon, task_completed, project_invite, mention, message, comment, custom]',
    }),
  title: Joi.string().required().trim().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.trim': 'Title must not have leading or trailing whitespace',
  }),
  content: Joi.string().required().trim().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content is not allowed to be empty',
    'string.trim': 'Content must not have leading or trailing whitespace',
  }),
  link: Joi.string().uri().optional().allow(null),
  related_id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).optional(),
  read: Joi.boolean().default(false),
  scheduled_for: Joi.date().optional().allow(null),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string()
    .valid('task_assigned', 'task_due_soon', 'task_completed', 'project_invite', 'mention', 'message', 'comment', 'custom')
    .required(),
  title: Joi.string().required().trim(),
  content: Joi.string().required().trim(),
  link: Joi.string().uri().optional().allow(null),
  related_id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).optional(),
})

const validateBeforeCreate = async (data) => {
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
