import mongoose from 'mongoose'

const PROJECT_ROLES_NAME = 'project_roles'

const PROJECT_ROLES_SCHEMA_MONGOOSE = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'projects',
    required: true,
    index: true,
  },
  default_role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'default_roles',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    match: /^[a-zA-Z0-9\s-_]+$/, // Chỉ cho phép chữ, số, dấu cách, -, _
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
}, { timestamps: true })

// Thêm unique index cho project_id và name
PROJECT_ROLES_SCHEMA_MONGOOSE.index({ project_id: 1, name: 1 }, { unique: true })

export const projectRolesModel = mongoose.model(PROJECT_ROLES_NAME, PROJECT_ROLES_SCHEMA_MONGOOSE)
