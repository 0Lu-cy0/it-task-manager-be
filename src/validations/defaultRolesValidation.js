// import Joi from 'joi'
// import { StatusCodes } from 'http-status-codes'
// import { ApiError } from '~/utils/ApiError'
// import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
// import { MESSAGES } from '~/constants/messages'

// const DEFAULT_ROLES_SCHEMA_JOI = Joi.object({
//   name: Joi.string()
//     .required()
//     .valid('owner', 'lead', 'member', 'viewer')
//     .messages({
//       'any.required': MESSAGES.ROLE_NAME_REQUIRED,
//       'any.only': MESSAGES.ROLE_NAME_INVALID,
//     }),
//   description: Joi.string().allow(null).default(null),
//   permissions: Joi.array()
//     .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
//     .required()
//     .messages({
//       'any.required': MESSAGES.ROLE_REQUIRED,
//     }),
//   created_at: Joi.date().default(Date.now),
//   updated_at: Joi.date().default(Date.now),
//   _destroy: Joi.boolean().default(false),
// })

// /**
//  * Xác thực dữ liệu trước khi tạo vai trò mặc định
//  */
// const validateBeforeCreate = async (data) => {
//   try {
//     return await DEFAULT_ROLES_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
//   } catch (error) {
//     throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
//   }
// }

// /**
//  * Xác thực dữ liệu cập nhật vai trò mặc định
//  */
// const validateUpdate = async (data) => {
//   const schema = Joi.object({
//     description: Joi.string().allow(null, ''),
//     permissions: Joi.array()
//       .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
//   })

//   try {
//     return await schema.validateAsync(data, { abortEarly: false })
//   } catch (error) {
//     throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
//   }
// }

// export const defaultRolesValidation = {
//   validateBeforeCreate,
//   validateUpdate,
// }
