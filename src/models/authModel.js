import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { MESSAGES } from '~/constants/messages'

const USER_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      minlength: 3,
      maxlength: 50,
      default: null,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      match: /^[0-9+()-\s]{8,20}$/,
      default: null,
    },
    department: {
      type: String,
      maxlength: 50,
      default: null,
    },
    language: {
      type: String,
      enum: ['vi', 'en', 'jp', 'fr'],
      default: 'vi',
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
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
  },
  { timestamps: false },
)

// Mã hóa mật khẩu trước khi lưu
USER_COLLECTION_SCHEMA_MONGOOSE.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10)
    } catch (error) {
      return next(new Error(MESSAGES.PASSWORD_HASH_ERROR))
    }
  }
  this.updated_at = Date.now()
  next()
})

export const authModel = mongoose.model('User', USER_COLLECTION_SCHEMA_MONGOOSE)
