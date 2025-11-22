import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { MESSAGES } from '~/constants/messages'
import { permissionModel } from '~/models/permissionModel'
import mongoose from 'mongoose'

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.custom')
  }
  return value
}

const BASE_ROLE_SCHEMA = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z0-9\s-_]+$/)
    .messages({
      'any.required': MESSAGES.ROLE_NAME_REQUIRED,
      'string.empty': MESSAGES.ROLE_NAME_EMPTY,
      'string.min': MESSAGES.ROLE_NAME_MIN,
      'string.max': MESSAGES.ROLE_NAME_MAX,
      'string.trim': MESSAGES.ROLE_NAME_TRIM,
      'string.pattern.base': MESSAGES.ROLE_NAME_INVALID,
    }),
  permissions: Joi.array()
    .items(
      Joi.string().custom(objectId).messages({
        'any.custom': MESSAGES.PERMISSION_ID_INVALID,
      })
    )
    .optional()
    .messages({
      'array.base': MESSAGES.PERMISSIONS_ARRAY,
    }),
})

const validateBeforeCreate = async data => {
  const schema = BASE_ROLE_SCHEMA.append({
    project_id: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.PROJECT_ID_REQUIRED,
      'any.custom': MESSAGES.PROJECT_ID_INVALID,
    }),
    default_role_id: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.DEFAULT_ROLE_ID_REQUIRED,
      'any.custom': MESSAGES.DEFAULT_ROLE_ID_INVALID,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdate = async data => {
  const schema = BASE_ROLE_SCHEMA

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateAddPermission = async data => {
  const schema = Joi.object({
    permissionId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.PERMISSION_ID_REQUIRED,
      'any.custom': MESSAGES.PERMISSION_ID_INVALID,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateRemovePermission = async data => {
  const schema = Joi.object({
    projectId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.PROJECT_ID_REQUIRED,
      'any.custom': MESSAGES.PROJECT_ID_INVALID,
    }),
    roleId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.ROLE_ID_REQUIRED,
      'any.custom': MESSAGES.ROLE_ID_INVALID,
    }),
    permissionId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.PERMISSION_ID_REQUIRED,
      'any.custom': MESSAGES.PERMISSION_ID_INVALID,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateGetPermissions = async data => {
  const schema = Joi.object({
    projectId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.PROJECT_ID_REQUIRED,
      'any.custom': MESSAGES.PROJECT_ID_INVALID,
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

const validateAssignRole = async data => {
  const schema = Joi.object({
    projectId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.PROJECT_ID_REQUIRED,
      'any.custom': MESSAGES.PROJECT_ID_INVALID,
    }),
    memberId: Joi.string().required().custom(objectId).messages({
      'any.required': MESSAGES.MEMBER_ID_REQUIRED,
      'any.custom': MESSAGES.MEMBER_ID_INVALID,
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
  const permissionDocs = await permissionModel.find({ _destroy: false }, { _id: 1 }).lean()
  if (!permissionDocs.length) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Không tìm thấy quyền hợp lệ trong hệ thống'
    )
  }
  const validPermissionIds = permissionDocs.map(p => p._id.toString())

  const schema = Joi.object({
    permissions: Joi.array()
      .items(
        Joi.string()
          .valid(...validPermissionIds)
          .messages({
            'any.only': MESSAGES.PERMISSION_ID_INVALID,
          })
      )
      .required()
      .max(50)
      .messages({
        'any.required': MESSAGES.PERMISSIONS_REQUIRED,
        'array.max': MESSAGES.PERMISSIONS_MAX,
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const projectRoleValidation = {
  validateBeforeCreate,
  validateUpdate,
  validateAddPermission,
  validateRemovePermission,
  validateGetPermissions,
  validateAssignRole,
  validateUpdateRolePermissions,
}
