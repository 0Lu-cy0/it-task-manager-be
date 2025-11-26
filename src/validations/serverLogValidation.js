import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'

/**
 * Schema Joi cho việc tạo server log
 */
const createLogSchema = Joi.object({
  content: Joi.string().required().max(5000).messages({
    'string.base': 'Nội dung log phải là chuỗi',
    'string.empty': 'Nội dung log không được để trống',
    'string.max': 'Nội dung log không được vượt quá 5000 ký tự',
    'any.required': 'Nội dung log là bắt buộc',
  }),
  logHistory: Joi.string().max(1000).allow(null, '').messages({
    'string.base': 'Lịch sử log phải là chuỗi',
    'string.max': 'Lịch sử log không được vượt quá 1000 ký tự',
  }),
})

/**
 * Xác thực dữ liệu trước khi tạo log
 */
const validateCreateLog = async data => {
  try {
    return await createLogSchema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Xác thực query parameters cho GET logs
 */
const validateGetLogsQuery = query => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Trang phải là số',
      'number.min': 'Trang phải lớn hơn hoặc bằng 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(50).messages({
      'number.base': 'Giới hạn phải là số',
      'number.min': 'Giới hạn phải lớn hơn hoặc bằng 1',
      'number.max': 'Giới hạn không được vượt quá 100',
    }),
    userId: Joi.string().hex().length(24).messages({
      'string.hex': 'ID người dùng không hợp lệ',
      'string.length': 'ID người dùng phải có 24 ký tự',
    }),
  })

  const { error, value } = schema.validate(query)
  if (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, error.message)
  }
  return value
}

export const serverLogValidation = {
  validateCreateLog,
  validateGetLogsQuery,
}
