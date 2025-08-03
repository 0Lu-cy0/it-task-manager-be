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

export const projectRolesModel = mongoose.model(PROJECT_ROLES_NAME, PROJECT_ROLES_SCHEMA_MONGOOSE)
