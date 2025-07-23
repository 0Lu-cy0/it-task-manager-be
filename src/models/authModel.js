//src\models\authModel.js
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const AUTH_COLLECTION_NAME = 'auths'

const AUTH_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

// Mã hóa mật khẩu trước khi lưu
AUTH_COLLECTION_SCHEMA_MONGOOSE.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  this.updated_at = Date.now()
  next()
})

export const authModel = mongoose.model(
  AUTH_COLLECTION_NAME,
  AUTH_COLLECTION_SCHEMA_MONGOOSE,
)
