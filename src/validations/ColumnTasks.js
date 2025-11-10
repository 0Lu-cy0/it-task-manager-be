import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { title } from 'process'

export const COLUMN_TASKS_SCHEMA_JOI = Joi.object({
  title: Joi.string().min(1).max(50).required(),
  project_id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
})

export const updateColumnShema = Joi.object({
  title: Joi.string().min(1).max(200),
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ),
})

export const moveCardShema = Joi.object({
  cardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  fromColumnId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  toColumnId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  position: Joi.number().min(0).optional(),
})
