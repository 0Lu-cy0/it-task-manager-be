import Joi from 'joi'

const ROLE_COLLECTION_NAME = 'roles'
const ROLE_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required(),
  permissions: Joi.array().items(Joi.string()).default([]),
  description: Joi.string().allow(null).default(null),
  created_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const roleModel = {
  ROLE_COLLECTION_NAME,
  ROLE_COLLECTION_SCHEMA,
}
