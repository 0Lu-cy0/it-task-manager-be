import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { MESSAGES } from '~/constants/messages'

/**
 * Schema Joi cho collection người dùng
 * @description Định nghĩa cấu trúc dữ liệu của người dùng trong database
 * @type {Joi.ObjectSchema}
 */
const USER_COLLECTION_SCHEMA_JOI = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': MESSAGES.EMAIL_INVALID,
    'any.required': MESSAGES.EMAIL_REQUIRED,
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
    .messages({
      'string.min': MESSAGES.PASSWORD_MIN,
      'string.pattern.base': MESSAGES.PASSWORD_PATTERN,
      'any.required': MESSAGES.PASSWORD_REQUIRED,
    }),
  full_name: Joi.string().min(3).max(50).required().messages({
    'string.min': MESSAGES.NAME_MIN,
    'string.max': MESSAGES.NAME_MAX,
    'any.required': MESSAGES.NAME_REQUIRED,
  }),
  avatar_url: Joi.string().uri().allow(null, '').messages({
    'string.uri': MESSAGES.AVATAR_INVALID,
  }),
  phone: Joi.string()
    .pattern(/^[0-9+()-\s]{8,20}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': MESSAGES.PHONE_INVALID,
    }),
  department: Joi.string().max(50).allow(null, '').messages({
    'string.max': MESSAGES.DEPARTMENT_MAX,
  }),
  language: Joi.string().valid('vi', 'en', 'jp', 'fr').default('vi').messages({
    'any.only': MESSAGES.LANGUAGE_INVALID,
  }),
  is_verified: Joi.boolean().default(false),
  resetToken: Joi.string().allow(null),
  resetTokenExpiry: Joi.date().allow(null),
  created_at: Joi.date().default(Date.now),
  updated_at: Joi.date().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

/**
 * Schema Joi cho đăng ký người dùng
 * @description Tách riêng để kiểm soát chặt chẽ dữ liệu đầu vào
 * @type {Joi.ObjectSchema}
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': MESSAGES.EMAIL_INVALID,
    'any.required': MESSAGES.EMAIL_REQUIRED,
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
    .messages({
      'string.min': MESSAGES.PASSWORD_MIN,
      'string.pattern.base': MESSAGES.PASSWORD_PATTERN,
      'any.required': MESSAGES.PASSWORD_REQUIRED,
    }),
  full_name: Joi.string().min(3).max(50).required().messages({
    'string.min': MESSAGES.NAME_MIN,
    'string.max': MESSAGES.NAME_MAX,
    'any.required': MESSAGES.NAME_REQUIRED,
  }),
})

/**
 * Schema Joi cho đăng nhập
 * @description Tách riêng để kiểm soát chặt chẽ dữ liệu đầu vào
 * @type {Joi.ObjectSchema}
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': MESSAGES.EMAIL_INVALID,
    'any.required': MESSAGES.EMAIL_REQUIRED,
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
    .messages({
      'string.min': MESSAGES.PASSWORD_MIN,
      'string.pattern.base': MESSAGES.PASSWORD_PATTERN,
      'any.required': MESSAGES.PASSWORD_REQUIRED,
    }),
})

/**
 * Schema Joi cho yêu cầu đặt lại mật khẩu
 * @description Tách riêng để kiểm soát chặt chẽ dữ liệu đầu vào
 * @type {Joi.ObjectSchema}
 */
const validateResetPasswordRequest = async data => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': MESSAGES.EMAIL_INVALID,
      'any.required': MESSAGES.EMAIL_REQUIRED,
    }),
  })
  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Schema Joi cho xác nhận đặt lại mật khẩu
 * @description Tách riêng để kiểm soát chặt chẽ dữ liệu đầu vào
 * @type {Joi.ObjectSchema}
 */
const validateResetPasswordConfirm = async data => {
  const schema = Joi.object({
    resetToken: Joi.string().required().messages({
      'any.required': MESSAGES.RESET_TOKEN_REQUIRED,
    }),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
      .messages({
        'string.min': MESSAGES.PASSWORD_MIN,
        'string.pattern.base': MESSAGES.PASSWORD_PATTERN,
        'any.required': MESSAGES.PASSWORD_REQUIRED,
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': MESSAGES.PASSWORD_MISMATCH,
      'any.required': MESSAGES.PASSWORD_REQUIRED,
    }),
  })
  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Xác thực dữ liệu trước khi đăng ký
 * @param {Object} data - Dữ liệu đăng ký (email, password, full_name)
 * @returns {Object} Dữ liệu đã được xác thực
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateBeforeRegister = async data => {
  try {
    return await registerSchema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Xác thực dữ liệu trước khi đăng nhập
 * @param {Object} data - Dữ liệu đăng nhập (email, password)
 * @returns {Object} Dữ liệu đã được xác thực
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateBeforeLogin = async data => {
  try {
    return await loginSchema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Xác thực dữ liệu cập nhật hồ sơ
 * @param {Object} data - Dữ liệu cập nhật (full_name, avatar_url, phone, department, language)
 * @returns {Object} Dữ liệu đã được xác thực
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validateProfileUpdate = async data => {
  const schema = Joi.object({
    full_name: Joi.string().min(3).max(50).messages({
      // Không required vì là cập nhật
      'string.min': MESSAGES.NAME_MIN,
      'string.max': MESSAGES.NAME_MAX,
    }),
    cccd_number: Joi.string().allow(null, '').messages({
      'string.base': 'Số CCCD không hợp lệ',
    }),
    birth_date: Joi.date().allow(null).messages({
      'date.base': 'Ngày sinh không hợp lệ',
    }),
    gender: Joi.string().valid('Nam', 'Nữ', 'Khác').allow(null, '').messages({
      'any.only': 'Giới tính không hợp lệ',
    }),
    nationality: Joi.string().allow(null, '').messages({
      'string.base': 'Quốc tịch không hợp lệ',
    }),
    expiry_date: Joi.date().allow(null).messages({
      'date.base': 'Ngày hết hạn không hợp lệ',
    }),
    hometown: Joi.string().allow(null, '').messages({
      'string.base': 'Quê quán không hợp lệ',
    }),
    residence_address: Joi.string().allow(null, '').messages({
      'string.base': 'Nơi thường trú không hợp lệ',
    }),
    avatar_url: Joi.string().uri().allow(null, '').messages({
      'string.uri': MESSAGES.AVATAR_INVALID,
    }),
    phone: Joi.string()
      .pattern(/^[0-9+()-\s]{8,20}$/)
      .allow(null, '')
      .messages({
        'string.pattern.base': MESSAGES.PHONE_INVALID,
      }),
    department: Joi.string().max(50).allow(null, '').messages({
      'string.max': MESSAGES.DEPARTMENT_MAX,
    }),
    language: Joi.string().valid('vi', 'en', 'jp', 'fr').messages({
      'any.only': MESSAGES.LANGUAGE_INVALID,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

/**
 * Xác thực dữ liệu đổi mật khẩu
 * @param {Object} data - Dữ liệu mật khẩu (currentPassword, newPassword, confirmPassword)
 * @returns {Object} Dữ liệu đã được xác thực
 * @throws {ApiError} Nếu dữ liệu không hợp lệ
 */
const validatePasswordChange = async data => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().min(8).messages({
      'any.required': MESSAGES.PASSWORD_REQUIRED,
      'string.min': MESSAGES.PASSWORD_MIN,
    }),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
      .not(Joi.ref('currentPassword'))
      .messages({
        'string.min': MESSAGES.PASSWORD_MIN,
        'string.pattern.base': MESSAGES.PASSWORD_PATTERN,
        'any.required': MESSAGES.PASSWORD_REQUIRED,
        'any.invalid': MESSAGES.NEW_PASSWORD_DIFFRIENT,
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': MESSAGES.PASSWORD_MISMATCH,
      'any.required': MESSAGES.PASSWORD_REQUIRED,
    }),
  })

  try {
    return await schema.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

// Định nghĩa schema bằng Joi
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.base': MESSAGES.INVALID_REFRESH_TOKEN,
    'any.required': MESSAGES.REFRESH_TOKEN_REQUIRED,
    'string.empty': MESSAGES.REFRESH_TOKEN_REQUIRED,
  }),
})

// Middleware validate bằng Joi
export const validateRefreshToken = (req, res, next) => {
  const { error } = refreshTokenSchema.validate(req.body)

  if (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, error.details[0].message)
  }
  next()
}

export const authValidation = {
  USER_COLLECTION_SCHEMA_JOI,
  validateBeforeRegister,
  validateBeforeLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateResetPasswordRequest,
  validateResetPasswordConfirm,
  validateRefreshToken,
}
