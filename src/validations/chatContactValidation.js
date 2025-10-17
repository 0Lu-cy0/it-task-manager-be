import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const CHATCONTACT_COLLECTION_SCHEMA_JOI = Joi.object({
  user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  contact_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  added_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const CREATE_NEW_SCHEMA = Joi.object({
  user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  contact_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
})

const validateBeforeCreate = async (data) => {
  try {
    return await CHATCONTACT_COLLECTION_SCHEMA_JOI.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message)
  }
}

export const chatContactValidation = {
  CHATCONTACT_COLLECTION_SCHEMA_JOI,
  CREATE_NEW_SCHEMA,
  validateBeforeCreate,
}
