import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const TASK_COLLECTION_NAME = 'tasks'
export const TASK_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().allow(null).default(null),
  status: Joi.string().required(),
  priority: Joi.string().required().pattern(),
  project_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  due_date: Joi.date().allow(null).default(null),
  completed_at: Joi.date().allow(null).default(null),
  assignees: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      assigned_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      assigned_at: Joi.date().timestamp().default(Date.now),
    }),
  ).default([]),
  tags: Joi.array().items(Joi.string()).default([]),
  reminders: Joi.array().items(
    Joi.object({
      time: Joi.date().required(),
      type: Joi.string().valid('email', 'popup', 'push', 'sms').default('popup'),
      method: Joi.string().optional(),
      created_by: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      created_at: Joi.date().timestamp().default(Date.now),
    }),
  ).default([]),
  permissions: Joi.object({
    can_edit: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    can_delete: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    can_assign: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  }).default(),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

export const taskModel = {
  TASK_COLLECTION_NAME,
  TASK_COLLECTION_SCHEMA,
}
