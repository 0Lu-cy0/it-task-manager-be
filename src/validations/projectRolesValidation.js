import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'
import { permissionModel } from '~/models/permissionModel'

const PROJECT_ROLES_SCHEMA_JOI = Joi.object({
  project_id: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  default_role_id: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().required().min(3).max(50).trim().messages({
    'any.required': MESSAGES.ROLE_NAME_REQUIRED,
    'string.min': MESSAGES.ROLE_NAME_MIN,
    'string.max': MESSAGES.ROLE_NAME_MAX,
    'string.trim': MESSAGES.ROLE_NAME_TRIM,
  }),
  permissions: Joi.array()
    .items(Joi.string()) // Thay đổi từ ObjectId sang String
    .required()
    .messages({
      'any.required': 'Danh sách quyền là bắt buộc',
    }),
  created_at: Joi.date().default(Date.now),
  updated_at: Joi.date().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

/**
 * Xác thực dữ liệu cập nhật vai trò dự án
 */
const validateUpdate = async (data) => {
  // Lấy danh sách tên quyền hợp lệ
  const permissionDocs = await permissionModel.find({ _destroy: false }, { name: 1 }).lean()
  const validPermissionNames = permissionDocs.map(p => p.name)

  const schema = Joi.object({
    name: Joi.string().min(3).max(50).trim().messages({
      'string.min': MESSAGES.ROLE_NAME_MIN,
      'string.max': MESSAGES.ROLE_NAME_MAX,
      'string.trim': MESSAGES.ROLE_NAME_TRIM,
    }),
    permissions: Joi.array()
      .items(Joi.string().valid(...validPermissionNames)) // Kiểm tra permissions hợp lệ
      .messages({
        'any.only': 'Quyền không hợp lệ',
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const projectRolesValidation = {
  validateUpdate,
}
