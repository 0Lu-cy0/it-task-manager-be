import mongoose from 'mongoose'

const DEFAULT_ROLES_NAME = 'default_roles'

const DEFAULT_ROLES_SCHEMA_MONGOOSE = new mongoose.Schema({
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
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  _destroy: {
    type: Boolean,
    default: false,
  },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const defaultRolesModel = mongoose.model(DEFAULT_ROLES_NAME, DEFAULT_ROLES_SCHEMA_MONGOOSE)
