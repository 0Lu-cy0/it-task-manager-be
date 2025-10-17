import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'
import { permissionModel } from '~/models/permissionModel'
import mongoose from 'mongoose'

const BASE_PROJECT_SCHEMA = Joi.object({
  name: Joi.string().required().min(5).max(50).trim().strict().messages({
    'any.required': MESSAGES.TITLE_REQUIRED,
    'string.empty': MESSAGES.TITLE_EMPTY,
    'string.min': MESSAGES.TITLE_MIN,
    'string.max': MESSAGES.TITLE_MAX,
    'string.trim': MESSAGES.TITLE_TRIM,
  }),
  description: Joi.string().allow(null).default(null),
  status: Joi.string().valid('planning', 'in_progress', 'testing', 'completed').required().messages({
    'any.required': MESSAGES.STATUS_REQUIRED,
    'any.only': MESSAGES.STATUS_INVALID,
  }),
  priority: Joi.string().valid('low', 'medium', 'high').required().messages({
    'any.required': MESSAGES.PRIORITY_REQUIRED,
    'any.only': MESSAGES.PRIORITY_INVALID,
  }),
})

const PROJECT_COLLECTION_SCHEMA_JOI = BASE_PROJECT_SCHEMA.append({
  progress: Joi.number().min(0).max(100).default(0),
  start_date: Joi.date().allow(null).default(null),
  end_date: Joi.date().allow(null)
    .greater(Joi.ref('start_date'))
    .messages({
      'date.greater': MESSAGES.END_DATE_INVALID,
    }),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  deputy_lead: Joi.string().allow(null).pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  members: Joi.array()
    .items(
      Joi.object({
        user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        project_role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        joined_at: Joi.date().default(Date.now),
      }),
    )
    .unique((a, b) => a.user_id === b.user_id)
    .default([]),
  created_at: Joi.date().default(Date.now),
  updated_at: Joi.date().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

const CREATE_NEW_SCHEMA = BASE_PROJECT_SCHEMA.append({
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
})

const validateBeforeCreate = async (data) => {
  try {
    return await CREATE_NEW_SCHEMA.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdate = async (data) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).trim().messages({
      'string.min': MESSAGES.TITLE_MIN,
      'string.max': MESSAGES.TITLE_MAX,
      'string.trim': MESSAGES.TITLE_TRIM,
    }),
    description: Joi.string().allow(null, ''),
    status: Joi.string().valid('planning', 'in_progress', 'testing', 'completed').messages({
      'any.only': MESSAGES.STATUS_INVALID,
    }),
    priority: Joi.string().valid('low', 'medium', 'high').messages({
      'any.only': MESSAGES.PRIORITY_INVALID,
    }),
    start_date: Joi.date().allow(null),
    end_date: Joi.date().allow(null)
      .greater(Joi.ref('start_date'))
      .messages({
        'date.greater': MESSAGES.END_DATE_INVALID,
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
    //abortEarly: false: Tiếp tục kiểm tra và trả về tất cả các lỗi thay vì chỉ trả về lỗi đầu tiên
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateAddMember = async (data) => {
  const schema = Joi.object({
    user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateUpdateMemberRole = async (data) => {
  const schema = Joi.object({
    change: Joi.array()
      .items(
        Joi.object({
          user_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
            'string.pattern.base': OBJECT_ID_RULE_MESSAGE,
            'any.required': 'User ID là bắt buộc',
          }),
          project_role_id: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
            'string.pattern.base': MESSAGES.ROLE_ONLY,
            'any.required': MESSAGES.ROLE_REQUIRED,
          }),
        }),
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Phải cung cấp ít nhất 1 thay đổi vai trò ',
        'any.required': 'Lỗi ở đây này :)))(Dòng 123 Project validation ấy =)))',
      }),
  })
  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}


const validateUpdateRolePermissions = async (data) => {
  // Lấy danh sách tên quyền hợp lệ (chưa bị _destroy)
  const permissionDocs = await permissionModel.find({ _destroy: false }, { name: 1 }).lean()
  const validPermissionNames = permissionDocs.map(p => p.name)

  // Tạo schema Joi
  const schema = Joi.object({
    permissions: Joi.array()
      .items(Joi.string().valid(...validPermissionNames))
      .required()
      .messages({
        'any.required': 'Danh sách quyền là bắt buộc',
        'any.only': 'Quyền không hợp lệ',
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

const validateToggleFreeMode = async (data) => {
  const schema = Joi.object({
    projectId: Joi.string().custom(objectId).required(),
    free_mode: Joi.boolean().required(),
  })
  await schema.validateAsync(data)
}

export const projectValidation = {
  validateBeforeCreate,
  validateUpdate,
  validateAddMember,
  validateUpdateMemberRole,
  validateUpdateRolePermissions,
  validateToggleFreeMode,
}
