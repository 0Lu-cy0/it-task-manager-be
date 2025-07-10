import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

//Định nghĩa Collection(Name & Scheme)
const PROJECT_COLLECTION_NAME = 'projects'
const PROJECT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(50).trim(),
  slug: Joi.string().required().min(3).trim(), //
  description: Joi.string().allow(null).default(null),
  status: Joi.string().optional(), //require()

  priority: Joi.string().optional(), //require()
  progress: Joi.number().min(0).max(100).default(0),
  start_date: Joi.date().allow(null).default(null),
  end_date: Joi.date().allow(null).default(null),
  created_by: Joi.string().optional().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), //require()
  team_lead: Joi.string().allow(null).pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  deputy_lead: Joi.string().allow(null).pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).default(null),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      role_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      joined_at: Joi.date().timestamp().default(Date.now),
    }),
  ).default([]),
  permissions: Joi.object({
    can_edit: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    can_delete: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    can_add_member: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  }).default(),
  member_count: Joi.number().default(0),
  created_at: Joi.date().timestamp().default(Date.now),
  updated_at: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await PROJECT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
  //abortEarly: true: Joi sẽ dừng lại ngay khi gặp lỗi đầu tiên.
  //abortEarly: false: Tiếp tục kiểm tra toàn bộ field → và trả về tất cả lỗi cùng lúc.
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data) //validate trước
    return await GET_DB().collection(PROJECT_COLLECTION_NAME).insertOne(validData)//truyền data đã được validate vào đây
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(PROJECT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const projectId = await GET_DB().collection(PROJECT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return projectId
  } catch (error) { throw new Error(error) }
}

export const projectModel = {
  PROJECT_COLLECTION_NAME,
  PROJECT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
}
