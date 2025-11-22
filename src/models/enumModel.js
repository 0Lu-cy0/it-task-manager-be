import mongoose from 'mongoose'

export const ENUM_COLLECTION_NAME = 'enums'

const ENUM_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['status', 'priority', 'role', 'tag'] },
    key: { type: String, required: true, trim: true },
    translations: {
      vi: { type: String, required: true },
      en: { type: String, required: true },
      jp: { type: String, required: true },
      fr: { type: String, required: true },
    },
  },
  { timestamps: true }
)

export const enumModel = mongoose.model(ENUM_COLLECTION_NAME, ENUM_COLLECTION_SCHEMA_MONGOOSE)
