import mongoose from 'mongoose'

export const ACCESS_REQUEST_COLLECTION_NAME = 'access_requests'

const ACCESS_REQUEST_SCHEMA = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'projects',
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      default: null,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
    reject_reason: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
  },
  { timestamps: true }
)

// Đảm bảo 1 user chỉ có 1 pending request cho 1 project
ACCESS_REQUEST_SCHEMA.index(
  { project_id: 1, user_id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
)

export const accessRequestModel = mongoose.model(
  ACCESS_REQUEST_COLLECTION_NAME,
  ACCESS_REQUEST_SCHEMA
)
