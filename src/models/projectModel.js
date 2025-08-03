import mongoose from 'mongoose'
import { projectRolesModel } from '~/models/projectRolesModel'

export const PROJECT_COLLECTION_NAME = 'projects'

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
        project_role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'project_roles', required: true },
        joined_at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    default: [],
    validate: [
      {
        validator: function (members) {
          const userIds = members.map(member => member.user_id.toString())
          return new Set(userIds).size === userIds.length
        },
        message: 'Không được phép có user_id trùng lặp trong danh sách thành viên',
      },
      {
        validator: async function (members) {
          const leadRoleIds = (
            await projectRolesModel.find({ project_id: this._id, name: 'lead' })
          ).map(role => role._id.toString())
          const leadCount = members.filter(member => leadRoleIds.includes(member.project_role_id.toString())).length
          return leadCount <= 1
        },
        message: 'Chỉ được phép có tối đa một lead trong dự án',
      },
    ],
  },
  member_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  this.member_count = this.members ? this.members.length : 0
  next()
})

export const projectModel = mongoose.model(PROJECT_COLLECTION_NAME, PROJECT_COLLECTION_SCHEMA_MONGOOSE)
