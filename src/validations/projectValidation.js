import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'
import { permissionModel } from '~/models/permissionModel'
import mongoose from 'mongoose'

const BASE_PROJECT_SCHEMA = Joi.object({
  name: Joi.string().required().min(5).max(50).trim().strict().messages({
    'any.required': MESSAGES.PROJECT_NAME_REQUIRED,
    'string.empty': MESSAGES.PROJECT_NAME_EMPTY,
    'string.min': MESSAGES.PROJECT_NAME_MIN,
    'string.max': MESSAGES.PROJECT_NAME_MAX,
    'string.trim': MESSAGES.PROJECT_NAME_TRIM,
  }),
  description: Joi.string().allow(null).default(null),
  status: Joi.string()
    .valid('planning', 'in_progress', 'testing', 'completed')
    .required()
    .messages({
      'any.required': MESSAGES.PROJECT_STATUS_REQUIRED,
      'any.only': MESSAGES.PROJECT_STATUS_INVALID,
    }),
  priority: Joi.string().valid('low', 'medium', 'high').required().messages({
    'any.required': MESSAGES.PROJECT_PRIORITY_REQUIRED,
    'any.only': MESSAGES.PROJECT_PRIORITY_INVALID,
  }),
  visibility: Joi.string().valid('private', 'public').default('private').messages({
    'any.only': MESSAGES.PROJECT_VISIBILITY_INVALID,
  }),
})

// Không sử dụng schema này vì đã có CREATE_NEW_SCHEMA
// const PROJECT_COLLECTION_SCHEMA_JOI = BASE_PROJECT_SCHEMA.append({ ... })

const CREATE_NEW_SCHEMA = BASE_PROJECT_SCHEMA.append({
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.USER_ID_INVALID,
    'any.required': MESSAGES.USER_ID_REQUIRED,
  }),
})

const validateBeforeCreate = async data => {
  try {
    return await CREATE_NEW_SCHEMA.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdate = async data => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).trim().messages({
      'string.min': MESSAGES.PROJECT_NAME_MIN,
      'string.max': MESSAGES.PROJECT_NAME_MAX,
      'string.trim': MESSAGES.PROJECT_NAME_TRIM,
    }),
    description: Joi.string().allow(null, ''),
    status: Joi.string().valid('planning', 'in_progress', 'testing', 'completed').messages({
      'any.only': MESSAGES.PROJECT_STATUS_INVALID,
    }),
    priority: Joi.string().valid('low', 'medium', 'high').messages({
      'any.only': MESSAGES.PROJECT_PRIORITY_INVALID,
    }),
    visibility: Joi.string().valid('private', 'public').messages({
      'any.only': MESSAGES.PROJECT_VISIBILITY_INVALID,
    }),
    start_date: Joi.date().allow(null),
    end_date: Joi.date().allow(null).greater(Joi.ref('start_date')).messages({
      'date.greater': MESSAGES.PROJECT_END_DATE_INVALID,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
    //abortEarly: false: Tiếp tục kiểm tra và trả về tất cả các lỗi thay vì chỉ trả về lỗi đầu tiên
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateAddMember = async data => {
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

const validateUpdateMemberRole = async data => {
  const schema = Joi.object({
    change: Joi.array()
      .items(
        Joi.object({
          user_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
            'string.pattern.base': MESSAGES.USER_ID_INVALID,
            'any.required': MESSAGES.USER_ID_REQUIRED,
          }),
          project_role_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
            'string.pattern.base': MESSAGES.ROLE_ID_INVALID,
            'any.required': MESSAGES.ROLE_ID_REQUIRED,
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Phải cung cấp ít nhất 1 thay đổi vai trò',
        'any.required': 'Danh sách thay đổi vai trò là bắt buộc',
      }),
  })
  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdateRolePermissions = async data => {
  // Lấy danh sách tên quyền hợp lệ (chưa bị _destroy)
  const permissionDocs = await permissionModel.find({ _destroy: false }, { name: 1 }).lean()
  const validPermissionNames = permissionDocs.map(p => p.name)

  // Tạo schema Joi
  const schema = Joi.object({
    permissions: Joi.array()
      .items(Joi.string().valid(...validPermissionNames))
      .required()
      .messages({
        'any.required': MESSAGES.PERMISSIONS_REQUIRED,
        'any.only': MESSAGES.PERMISSION_ID_INVALID,
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid')
  }
  return value
}

const validateToggleFreeMode = async data => {
  const schema = Joi.object({
    projectId: Joi.string().custom(objectId).required().messages({
      'any.required': MESSAGES.PROJECT_ID_REQUIRED,
      'any.invalid': MESSAGES.PROJECT_ID_INVALID,
    }),
    free_mode: Joi.boolean().required().messages({
      'any.required': 'Free mode là bắt buộc',
    }),
  })
  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const projectValidation = {
  validateBeforeCreate,
  validateUpdate,
  validateAddMember,
  validateUpdateMemberRole,
  validateUpdateRolePermissions,
  validateToggleFreeMode,
}
