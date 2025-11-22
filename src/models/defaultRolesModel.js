import mongoose from 'mongoose'

const DEFAULT_ROLES_NAME = 'default_roles'

const DEFAULT_ROLES_SCHEMA_MONGOOSE = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['owner', 'lead', 'member', 'viewer'], // Chỉ cho phép 4 vai trò mặc định
    },
    description: {
      type: String,
      default: null,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'permissions',
        required: true,
      },
    ],
    _destroy: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export const defaultRolesModel = mongoose.model(DEFAULT_ROLES_NAME, DEFAULT_ROLES_SCHEMA_MONGOOSE)
