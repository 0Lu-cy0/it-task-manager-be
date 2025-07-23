import mongoose from 'mongoose'

export const MESSAGE_COLLECTION_NAME = 'messages'

const MESSAGE_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'conversations', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  content: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const messageModel = mongoose.model(
  MESSAGE_COLLECTION_NAME,
  MESSAGE_COLLECTION_SCHEMA_MONGOOSE,
)
