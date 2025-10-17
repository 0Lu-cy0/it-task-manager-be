import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const MESSAGE_COLLECTION_SCHEMA_JOI = Joi.object({
  conversation_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  sender_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  content: Joi.string().required().trim().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content is not allowed to be empty',
    'string.trim': 'Content must not have leading or trailing whitespace',
  }),
  is_read: Joi.boolean().default(false),
  created_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  conversation_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  sender_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  content: Joi.string().required().trim(),
})

const validateBeforeCreate = async (data) => {
  try {
    return await MESSAGE_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const messageValidation = {
  MESSAGE_COLLECTION_SCHEMA_JOI,
  CREATE_NEW_SCHEMA,
  validateBeforeCreate,
}
