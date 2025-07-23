import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const CONVERSATION_COLLECTION_SCHEMA_JOI = Joi.object({
  type: Joi.string().valid('direct', 'group').required().messages({
    'any.required': 'Type is required',
    'string.empty': 'Type is not allowed to be empty',
    'any.only': 'Type must be one of [direct, group]',
  }),
  name: Joi.string().allow(null).default(null),
  members: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  type: Joi.string().valid('direct', 'group').required(),
  name: Joi.string().allow(null).default(null),
  members: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).required(),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
})

const validateBeforeCreate = async (data) => {
  try {
    return await CONVERSATION_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const conversationValidation = {
  CONVERSATION_COLLECTION_SCHEMA_JOI,
  CREATE_NEW_SCHEMA,
  validateBeforeCreate,
}
