import mongoose from 'mongoose'

/**
 * Tên collection của dự án trong cơ sở dữ liệu
 * @type {string}
 */
export const PROJECT_COLLECTION_NAME = 'projects'

/**
 * Schema Mongoose cho collection dự án
 * @description Định nghĩa cấu trúc dữ liệu của một dự án, bao gồm các trường như tên, trạng thái, ưu tiên, thành viên, quyền, v.v.
 * @type {mongoose.Schema}
 */
const PROJECT_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5, maxlength: 50, trim: true, index: true },
  description: { type: String, default: null },
  status: { type: String, required: true, enum: ['planning', 'in_progress', 'testing', 'completed'], index: true },
  priority: { type: String, required: true, enum: ['low', 'medium', 'high'], index: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  start_date: { type: Date, default: null },
  end_date: {
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        return !this.start_date || !value || value > this.start_date
      },
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
    },
  },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
  team_lead: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
  deputy_lead: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
  members: {
    type: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
        role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', required: true },
        joined_at: { type: Date, default: Date.now },
      },
    ],
    default: [],
    validate: {
      validator: function (members) {
        const userIds = members.map(member => member.user_id.toString())
        return new Set(userIds).size === userIds.length
      },
      message: 'Không được phép có user_id trùng lặp trong danh sách thành viên',
    },
  },
  permissions: {
    type: {
      can_edit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
      can_delete: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
      can_add_member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    },
    default: () => ({ can_edit: [], can_delete: [], can_add_member: [] }),
  },
  member_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  this.member_count = this.members.length
  next()
})

/**
 * Model Mongoose cho collection dự án
 * @type {mongoose.Model}
 */
export const projectModel = mongoose.model(
  PROJECT_COLLECTION_NAME,
  PROJECT_COLLECTION_SCHEMA_MONGOOSE,
)
