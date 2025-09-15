import mongoose from 'mongoose'

const REFRESH_TOKEN_COLLECTION_NAME = 'refresh_tokens'

const REFRESH_TOKEN_SCHEMA = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expires: '0' }, // Auto xóa khi hết hạn (TTL index)
  },
}, {
  timestamps: true,
})

export const refreshTokenModel = mongoose.model(REFRESH_TOKEN_COLLECTION_NAME, REFRESH_TOKEN_SCHEMA)
