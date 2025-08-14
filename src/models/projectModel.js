import mongoose from 'mongoose'
import { projectRolesModel } from '~/models/projectRolesModel'

export const PROJECT_COLLECTION_NAME = 'projects'

const PROJECT_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  name: { type: String, required: true, minlength: 5, maxlength: 50, trim: true, index: true },
  description: { type: String, default: null },
  status: { type: String, required: true, enum: ['planning', 'in_progress', 'testing', 'completed'], index: true },
  priority: { type: String, required: true, enum: ['low', 'medium', 'high'], index: true },
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
      // Validator 1: Chặn trùng (user_id + role)
      {
        validator: function (members) {
          const combos = members.map(m => `${m.user_id.toString()}_${m.project_role_id.toString()}`)
          return new Set(combos).size === combos.length
        },
        message: 'Không được phép có user_id với cùng project_role_id trùng lặp',
      },
      // Validator 2: Tối đa 1 lead
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
  _destroy: { type: Boolean, default: false },
  free_mode: { type: Boolean, default: false },
}, { timestamps: true })

// Virtual: Liên kết Project với Task
PROJECT_COLLECTION_SCHEMA_MONGOOSE.virtual('tasks', {
  ref: 'tasks', // Tên model Task
  localField: '_id', // Trường ở Project
  foreignField: 'projectId', // Trường ở Task liên kết Project
})

// Bật virtual khi convert sang JSON hoặc Object
PROJECT_COLLECTION_SCHEMA_MONGOOSE.set('toObject', { virtuals: true })
PROJECT_COLLECTION_SCHEMA_MONGOOSE.set('toJSON', { virtuals: true })

export const projectModel = mongoose.model(PROJECT_COLLECTION_NAME, PROJECT_COLLECTION_SCHEMA_MONGOOSE)
