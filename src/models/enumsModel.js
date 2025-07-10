import Joi from 'joi'

const ENUM_COLLECTION_NAME = 'enums'
const ENUM_COLLECTION_SCHEMA = Joi.object({
  type: Joi.string().valid('status', 'priority', 'role', 'tag').required(),
  key: Joi.string().required().trim(),
  translations: Joi.object({
    vi: Joi.string().required(),
    en: Joi.string().required(),
    jp: Joi.string().required(),
    fr: Joi.string().required(),
  }).required(),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
})

export const enumModel = {
  ENUM_COLLECTION_NAME,
  ENUM_COLLECTION_SCHEMA,
}
