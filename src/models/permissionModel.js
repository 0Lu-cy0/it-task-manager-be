import mongoose from 'mongoose'

export const PERMISSION_COLLECTION_NAME = 'permissions'

const PERMISSION_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
      index: true,
      unique: true,
    },
    description: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: ['project', 'task', 'message', 'auth', 'noti'],
    },
    _destroy: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export const permissionModel = mongoose.model(
  PERMISSION_COLLECTION_NAME,
  PERMISSION_COLLECTION_SCHEMA_MONGOOSE
)
