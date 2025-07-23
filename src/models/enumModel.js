import mongoose from 'mongoose'

export const ENUM_COLLECTION_NAME = 'enums'

const ENUM_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  type: { type: String, required: true, enum: ['status', 'priority', 'role', 'tag'] },
  key: { type: String, required: true, trim: true },
  translations: {
    vi: { type: String, required: true },
    en: { type: String, required: true },
    jp: { type: String, required: true },
    fr: { type: String, required: true },
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const enumModel = mongoose.model(
  ENUM_COLLECTION_NAME,
  ENUM_COLLECTION_SCHEMA_MONGOOSE,
)
