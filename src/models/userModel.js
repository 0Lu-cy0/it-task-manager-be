import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().required().trim(),
  email: Joi.string().email().required(),
  full_name: Joi.string().required(),
  role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  avatar_url: Joi.string().uri().allow(null).default(null),
  phone: Joi.string().allow(null).default(null),
  department: Joi.string().allow(null).default(null),
  language: Joi.string().valid('vi', 'en', 'jp', 'fr').default('en'),
  contacts: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
}
