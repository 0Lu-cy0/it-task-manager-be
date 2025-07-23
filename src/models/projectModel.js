import mongoose from 'mongoose'

export const PROJECT_COLLECTION_NAME = 'projects'

const PROJECT_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50, trim: true, index: true },
  description: { type: String, default: null },
  status: { type: String, required: true, enum: ['planning', 'in_progress', 'testing', 'completed'] },
  priority: { type: String, required: true, enum: ['low', 'medium', 'high'] },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
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
  },
  permissions: {
    can_edit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
    can_delete: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
    can_add_member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
  },
  member_count: { type: Number, default: function () { return this.members.length } },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const projectModel = mongoose.model(
  PROJECT_COLLECTION_NAME,
  PROJECT_COLLECTION_SCHEMA_MONGOOSE,
)
