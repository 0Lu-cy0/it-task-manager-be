import mongoose from 'mongoose'

export const PERMISSION_COLLECTION_NAME = 'permissions'

const PERMISSION_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    trim: true,
    index: true,
    unique: true,
  },
  description: {
    type: String,
    default: null,
  },
  catetory: {
    type: String,
    required: true,
    enum: [
      'project',
      'task',
      'message',
      'auth',
      'noti',
    ],
  },
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

export const permissionModel = mongoose.model(PERMISSION_COLLECTION_NAME, PERMISSION_COLLECTION_SCHEMA_MONGOOSE)
