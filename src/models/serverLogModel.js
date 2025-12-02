import mongoose from 'mongoose'

const SERVER_LOG_COLLECTION_NAME = 'server_logs'

const SERVER_LOG_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'projects',
      default: null,
      index: true,
    },
    logHistory: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    _destroy: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000, // TTL 30 ngày (30 * 24 * 60 * 60 = 2592000 giây)
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
)

// Index để tìm kiếm nhanh theo user và thời gian
SERVER_LOG_COLLECTION_SCHEMA_MONGOOSE.index({ user: 1, createdAt: -1 })
SERVER_LOG_COLLECTION_SCHEMA_MONGOOSE.index({ project: 1, createdAt: -1 })

// TTL Index - MongoDB sẽ tự động xóa documents sau 30 ngày kể từ createdAt
SERVER_LOG_COLLECTION_SCHEMA_MONGOOSE.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 })

export const serverLogModel = mongoose.model(
  SERVER_LOG_COLLECTION_NAME,
  SERVER_LOG_COLLECTION_SCHEMA_MONGOOSE
)
