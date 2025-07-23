import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

export const ROLE_COLLECTION_SCHEMA_JOI = Joi.object({
  name: Joi.string().required().trim().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name is not allowed to be empty',
    'string.trim': 'Name must not have leading or trailing whitespace',
  }),
  permissions: Joi.array().items(Joi.string()).default([]),
  description: Joi.string().allow(null).default(null),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  name: Joi.string().required().trim().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name is not allowed to be empty',
    'string.trim': 'Name must not have leading or trailing whitespace',
  }),
  permissions: Joi.array().items(Joi.string()).default([]),
  description: Joi.string().allow(null).default(null),
})

const validateBeforeCreate = async (data) => {
  try {
    return await ROLE_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const roleValidation = {
  ROLE_COLLECTION_SCHEMA_JOI,
  CREATE_NEW_SCHEMA,
  validateBeforeCreate,
}
