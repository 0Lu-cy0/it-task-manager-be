import mongoose from 'mongoose'

export const TASK_COLLECTION_NAME = 'tasks'

const TASK_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: null },
    status: { type: String, required: true, enum: ['todo', 'in_progress', 'testing', 'completed'] },
    priority: { type: String, required: true, enum: ['low', 'medium', 'high'] },
    type: {
      type: String,
      enum: ['task', 'story', 'bug', 'subtask', 'asset', 'epic', 'research', 'other'],
      default: 'task',
      index: true,
    },
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: true },
    columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'column', index: true }, // relation canonical
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    due_date: { type: Date, default: null },
    completed_at: { type: Date, default: null },
    assignees: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', required: true },
        assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        assigned_at: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String, default: [] }],
    reminders: [
      {
        time: { type: Date, required: true },
        type: { type: String, enum: ['email', 'popup', 'push', 'sms'], default: 'popup' },
        method: { type: String },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        created_at: { type: Date, default: Date.now },
      },
    ],
    _destroy: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const taskModel = mongoose.model(TASK_COLLECTION_NAME, TASK_COLLECTION_SCHEMA_MONGOOSE)
