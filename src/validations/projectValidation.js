import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'

/**
 * Schema cơ bản cho dự án
 * @description Định nghĩa các trường cơ bản của dự án (name, description, status, priority)
 * @type {Joi.ObjectSchema}
 */
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

/**
 * Schema Joi cho collection dự án
 * @description Định nghĩa đầy đủ các trường của dự án, bao gồm thành viên, quyền, v.v.
 * @type {Joi.ObjectSchema}
 */
const PROJECT_COLLECTION_SCHEMA_JOI = BASE_PROJECT_SCHEMA.append({
  progress: Joi.number().min(0).max(100).default(0),
  start_date: Joi.date().allow(null).default(null),
  end_date: Joi.date().allow(null).default(null)
    .greater(Joi.ref('start_date'))
    .messages({
      'date.greater': MESSAGES.END_DATE_INVALID,
    }),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  team_lead: Joi.string().allow(null).pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  deputy_lead: Joi.string().allow(null).pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  members: Joi.array()
    .items(
      Joi.object({
        user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        joined_at: Joi.date().default(Date.now),
      }),
    )
    .unique((a, b) => a.user_id === b.user_id)
    .default([]),
  permissions: Joi.object({
    can_edit: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    can_delete: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    can_add_member: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  }).default(),
  created_at: Joi.date().default(Date.now),
  updated_at: Joi.date().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

/**
 * Schema Joi cho tạo dự án mới
 * @description Định nghĩa các trường cần thiết để tạo dự án mới
 * @type {Joi.ObjectSchema}
 */
const CREATE_NEW_SCHEMA = BASE_PROJECT_SCHEMA.append({
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
})

/**
 * Xác thực dữ liệu trước khi tạo dự án
 * @param {Object} data - Dữ liệu dự án
 * @returns {Object} Dữ liệu đã được xác thực
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateBeforeCreate = async (data) => {
  try {
    return await PROJECT_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Xác thực dữ liệu cập nhật dự án
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Object} Dữ liệu đã được xác thực
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateUpdate = async (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).trim().messages({
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
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Xác thực dữ liệu thêm thành viên
 * @param {Object} data - Thông tin thành viên (user_id, role_id)
 * @returns {Object} Dữ liệu đã được xác thực
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateAddMember = async (data) => {
  const schema = Joi.object({
    user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Xác thực dữ liệu cập nhật vai trò thành viên
 * @param {Object} data - Thông tin vai trò (role_id)
 * @returns {Object} Dữ liệu đã được xác thực
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateUpdateMemberRole = async (data) => {
  const schema = Joi.object({
    role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
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
}
