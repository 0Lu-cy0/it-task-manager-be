import mongoose from 'mongoose'

export const CONVERSATION_COLLECTION_NAME = 'conversations'

const CONVERSATION_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['direct', 'group'] },
    name: { type: String, default: null },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    _destroy: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const conversationModel = mongoose.model(
  CONVERSATION_COLLECTION_NAME,
  CONVERSATION_COLLECTION_SCHEMA_MONGOOSE
)
