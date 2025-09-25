import mongoose from 'mongoose'

export const NOTIFICATION_COLLECTION_NAME = 'notifications'

const NOTIFICATION_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true,
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'projects',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['task_assigned', 'task_due_soon', 'task_completed', 'invite_created', 'member_joined', 'invite_accepted', 'invite_rejected', 'mention', 'message', 'comment', 'custom'],
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  related_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  read: {
    type: Boolean,
    default: false,
  },
  scheduled_for: {
    type: Date,
  },
}, {
  timestamps: true,
})

export const notificationModel = mongoose.model(
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA_MONGOOSE,
)
