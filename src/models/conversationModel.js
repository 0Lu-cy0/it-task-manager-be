import mongoose from 'mongoose'

export const CONVERSATION_COLLECTION_NAME = 'conversations'

const CONVERSATION_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  type: { type: String, required: true, enum: ['direct', 'group'] },
  name: { type: String, default: null },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const conversationModel = mongoose.model(
  CONVERSATION_COLLECTION_NAME,
  CONVERSATION_COLLECTION_SCHEMA_MONGOOSE,
)
