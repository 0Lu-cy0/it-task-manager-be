import mongoose from 'mongoose'

const USER_COLLECTION_NAME = 'users'

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
    _destroy: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const authModel = mongoose.model(USER_COLLECTION_NAME, USER_COLLECTION_SCHEMA_MONGOOSE)
