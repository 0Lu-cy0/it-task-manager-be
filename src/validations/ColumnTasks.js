import Joi from 'joi'
import { OBJECT_ID_RULE } from '~/utils/validators'
import { MESSAGES } from '~/constants/messages'

export const COLUMN_TASKS_SCHEMA_JOI = Joi.object({
  title: Joi.string().min(1).max(50).required(),
  project_id: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .messages({
      'string.pattern.base': MESSAGES.PROJECT_ID_INVALID,
    })
    .required(),
})

export const updateColumnShema = Joi.object({
  title: Joi.string().min(1).max(200),
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).messages({
      'string.pattern.base': MESSAGES.OBJECT_ID_INVALID,
    })
  ),
})

export const moveCardShema = Joi.object({
  cardId: Joi.string()
    .pattern(OBJECT_ID_RULE)
    .messages({
      'string.pattern.base': MESSAGES.TASK_ID_INVALID,
    })
    .required(),
  fromColumnId: Joi.string().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.COLUMN_ID_INVALID,
  }),
  toColumnId: Joi.string().pattern(OBJECT_ID_RULE).messages({
    'string.pattern.base': MESSAGES.COLUMN_ID_INVALID,
  }),
  position: Joi.number().min(0).optional(),
})
