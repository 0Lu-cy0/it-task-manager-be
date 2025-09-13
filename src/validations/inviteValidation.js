import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { MESSAGES } from '~/constants/messages'
import { projectRolesModel } from '~/models/projectRolesModel'
import mongoose from 'mongoose'

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.custom')
  }
  return value
}


const BASE_INVITE_SCHEMA = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .trim()
    .lowercase()
    .messages({
      'string.email': MESSAGES.EMAIL_INVALID,
    }),
  roleName: Joi.string()
    .valid('viewer', 'member')
    .optional()
    .messages({
      'any.only': MESSAGES.ROLE_NAME_INVALID,
    }),
})

const validateCreateInvite = async (data) => {
  const schema = BASE_INVITE_SCHEMA.append({
    invited_by: Joi.string().required().custom(objectId).messages({
      'any.required': 'Yêu cầu cần có người tạo lời mời',
      'any.custom': MESSAGES.OBJECT_ID_INVALID,
    }),
    invite_token: Joi.string().optional(),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateInviteAction = async (data) => {
  const schema = Joi.object({
    inviteId: Joi.string().required().custom(objectId).messages({
      'any.required': 'Yêu cầu cần có lời mời',
      'any.invalid': MESSAGES.OBJECT_ID_INVALID,
    }),
    action: Joi.string()
      .valid('accept', 'reject')
      .required()
      .messages({
        'any.required': 'Yêu cầu cần có action request',
        'any.only': 'Action invalid',
      }),
    roleName: Joi.string()
      .valid('viewer', 'member')
      .optional()
      .messages({
        'any.only': MESSAGES.ROLE_NAME_INVALID,
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateParams = async (data) => {
  const schema = Joi.object({
    projectId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.PROJECT_ID_REQUIRED,
      'any.invalid': MESSAGES.OBJECT_ID_INVALID,
    }),
    token: Joi.string().optional(),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdateRolePermissions = async (data) => {
  const roleDocs = await projectRolesModel.find({ _destroy: false }, { name: 1 }).lean()
  if (!roleDocs.length) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR)
  }
  const validRoleNames = roleDocs.map(r => r.name)

  const schema = Joi.object({
    roleName: Joi.string()
      .valid(...validRoleNames)
      .required()
      .messages({
        'any.required': MESSAGES.ROLE_NAME_REQUIRED,
        'any.only': MESSAGES.ROLE_NAME_INVALID,
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const inviteValidate = {
  validateCreateInvite,
  validateInviteAction,
  validateParams,
  validateUpdateRolePermissions,
}
