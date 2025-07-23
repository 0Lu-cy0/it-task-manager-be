import mongoose from 'mongoose'

export const NOTIFICATION_COLLECTION_NAME = 'notifications'

const NOTIFICATION_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  type: {
    type: String,
    required: true,
    enum: ['task_assigned', 'task_due_soon', 'task_completed', 'project_invite', 'mention', 'message', 'comment', 'custom'],
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  link: { type: String },
  related_id: { type: mongoose.Schema.Types.ObjectId },
  read: { type: Boolean, default: false },
  scheduled_for: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const notificationModel = mongoose.model(
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA_MONGOOSE,
)
