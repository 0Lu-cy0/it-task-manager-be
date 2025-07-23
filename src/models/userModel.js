import mongoose from 'mongoose'

export const USER_COLLECTION_NAME = 'users'

const USER_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  full_name: { type: String, required: true },
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', required: true },
  avatar_url: { type: String, default: null },
  phone: { type: String, default: null },
  department: { type: String, default: null },
  language: { type: String, enum: ['vi', 'en', 'jp', 'fr'], default: 'en' },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const userModel = mongoose.model(
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA_MONGOOSE,
)
