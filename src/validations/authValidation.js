//\src\validations\authVaildation.js
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Schema để validate toàn bộ dữ liệu user trong database
const AUTH_COLLECTION_SCHEMA_JOI = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất một chữ cái và một số',
      'any.required': 'Mật khẩu là bắt buộc',
    }),
  is_verified: Joi.boolean().default(false),
  created_at: Joi.date().default(Date.now),
  updated_at: Joi.date().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

// Schema để validate dữ liệu khi đăng ký
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất một chữ cái và một số',
      'any.required': 'Mật khẩu là bắt buộc',
    }),
})

// Schema để validate dữ liệu khi đăng nhập
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc',
  }),
})

// Hàm validate dữ liệu trước khi đăng ký (dùng trong repository)
const validateBeforeRegister = async (data) => {
  try {
    return await registerSchema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

// Hàm validate dữ liệu trước khi đăng nhập (dùng trong middleware)
const validateBeforeLogin = async (data) => {
  try {
    return await loginSchema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validateProfileUpdate = async (data) => {
  const schema = Joi.object({
    full_name: Joi.string().min(3).max(50).messages({
      'string.min': 'Tên phải có ít nhất 3 ký tự',
      'string.max': 'Tên không được vượt quá 50 ký tự',
    }),
    avatar_url: Joi.string().uri().allow(null, '').messages({
      'string.uri': 'URL avatar không hợp lệ',
    }),
    phone: Joi.string().pattern(/^[0-9+()-\s]{8,20}$/).allow(null, '').messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ',
    }),
    department: Joi.string().max(50).allow(null, '').messages({
      'string.max': 'Tên phòng ban không được vượt quá 50 ký tự',
    }),
    language: Joi.string().valid('vi', 'en', 'jp', 'fr').messages({
      'any.only': 'Ngôn ngữ phải là một trong các giá trị: vi, en, jp, fr',
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

const validatePasswordChange = async (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().min(8).messages({
      'any.required': 'Mật khẩu hiện tại là bắt buộc',
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
    }),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
      .not(Joi.ref('currentPassword'))
      .messages({
        'string.min': 'Mật khẩu mới phải có ít nhất 8 ký tự',
        'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất một chữ cái và một số',
        'any.required': 'Mật khẩu mới là bắt buộc',
        'any.invalid': 'Mật khẩu mới phải khác mật khẩu hiện tại',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Mật khẩu xác nhận không khớp',
        'any.required': 'Mật khẩu xác nhận là bắt buộc',
      }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const authValidation = {
  AUTH_COLLECTION_SCHEMA_JOI,
  registerSchema,
  loginSchema,
  validateBeforeRegister,
  validateBeforeLogin,
  validateProfileUpdate,
  validatePasswordChange,
}
