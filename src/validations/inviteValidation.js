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
  roleName: Joi.string().valid('member', 'lead').optional().messages({
    'any.only': MESSAGES.ROLE_NAME_INVALID,
  }),
})

const validateCreateInvite = async data => {
  const schema = BASE_INVITE_SCHEMA.append({
    invited_by: Joi.string().required().custom(objectId).messages({
      'any.required': 'Người tạo lời mời là bắt buộc',
      'any.custom': MESSAGES.USER_ID_INVALID,
    }),
    invite_token: Joi.string().optional(),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateInviteAction = async data => {
  const schema = Joi.object({
    inviteId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.INVITE_ID_REQUIRED,
      'any.custom': MESSAGES.INVITE_ID_INVALID,
    }),
    action: Joi.string().valid('accept', 'reject').required().messages({
      'any.required': 'Action là bắt buộc',
      'any.only': 'Action phải là "accept" hoặc "reject"',
    }),
    roleName: Joi.string().valid('member', 'lead').optional().messages({
      'any.only': MESSAGES.ROLE_NAME_INVALID,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateParams = async data => {
  const schema = Joi.object({
    projectId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.PROJECT_ID_REQUIRED,
      'any.custom': MESSAGES.PROJECT_ID_INVALID,
    }),
    token: Joi.string().optional(),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateSendInviteEmail = async data => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .trim()
      .lowercase()
      .messages({
        'string.email': MESSAGES.EMAIL_INVALID,
        'any.required': MESSAGES.INVITE_EMAIL_REQUIRED,
      }),
    roleId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.ROLE_ID_REQUIRED,
      'any.custom': MESSAGES.ROLE_ID_INVALID,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdateRolePermissions = async data => {
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
  validateSendInviteEmail,
  validateUpdateRolePermissions,
}
