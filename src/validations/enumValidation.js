import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

export const ENUM_COLLECTION_SCHEMA_JOI = Joi.object({
  type: Joi.string().valid('status', 'priority', 'role', 'tag').required().messages({
    'any.required': 'Type is required',
    'string.empty': 'Type is not allowed to be empty',
    'any.only': 'Type must be one of [status, priority, role, tag]',
  }),
  key: Joi.string().required().trim().messages({
    'any.required': 'Key is required',
    'string.empty': 'Key is not allowed to be empty',
    'string.trim': 'Key must not have leading or trailing whitespace',
  }),
  translations: Joi.object({
    vi: Joi.string().required().messages({
      'any.required': 'Vietnamese translation is required',
      'string.empty': 'Vietnamese translation is not allowed to be empty',
    }),
    en: Joi.string().required().messages({
      'any.required': 'English translation is required',
      'string.empty': 'English translation is not allowed to be empty',
    }),
    jp: Joi.string().required().messages({
      'any.required': 'Japanese translation is required',
      'string.empty': 'Japanese translation is not allowed to be empty',
    }),
    fr: Joi.string().required().messages({
      'any.required': 'French translation is required',
      'string.empty': 'French translation is not allowed to be empty',
    }),
  }).required(),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  type: Joi.string().valid('status', 'priority', 'role', 'tag').required().messages({
    'any.required': 'Type is required',
    'string.empty': 'Type is not allowed to be empty',
    'any.only': 'Type must be one of [status, priority, role, tag]',
  }),
  key: Joi.string().required().trim().messages({
    'any.required': 'Key is required',
    'string.empty': 'Key is not allowed to be empty',
    'string.trim': 'Key must not have leading or trailing whitespace',
  }),
  translations: Joi.object({
    vi: Joi.string().required(),
    en: Joi.string().required(),
    jp: Joi.string().required(),
    fr: Joi.string().required(),
  }).required(),
})

const validateBeforeCreate = async (data) => {
  try {
    return await ENUM_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const enumValidation = {
  ENUM_COLLECTION_SCHEMA_JOI,
  CREATE_NEW_SCHEMA,
  validateBeforeCreate,
}
