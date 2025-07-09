import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

//Định nghĩa Collection(Name & Scheme)
const PROJECT_COLLECTION_NAME = 'projects'
const PROJECT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(5).max(50).trim().strict(),
  slug: Joi.string().required().min(5).trim().strict(),
  description: Joi.string().required().min(5).max(300).trim().strict(),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().optional().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      role_id: Joi.string().optional().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      joined_at: Joi.date().timestamp('javascript').default(Date.now),
    }),
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

export const projectModel = {
  PROJECT_COLLECTION_NAME,
  PROJECT_COLLECTION_SCHEMA,
}
