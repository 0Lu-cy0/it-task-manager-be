import mongoose from 'mongoose'

export const INVITE_COLLECTION_NAME = 'invites'

const INVITE_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'projects',
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: function () {
      return !this.invite_token // Bắt buộc email nếu không dùng token (link invite)
    },
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    index: true,
  },
  invite_token: {
    type: String,
    unique: true,
    sparse: true, // Cho phép null nhưng vẫn đảm bảo tính duy nhất nếu có giá trị
    index: true,
  },
  invited_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending',
    index: true,
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project_roles',
    required: true, // Vai trò mặc định khi mời, ví dụ: viewer hoặc member
  },
  expires_at: {
    type: Date,
    required: false,
    index: true,
  },
}, { timestamps: true })

// Đảm bảo chỉ có 1 lời mời pending cho 1 email hoặc token trong 1 dự án
INVITE_COLLECTION_SCHEMA_MONGOOSE.index(
  { project_id: 1, email: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
)
INVITE_COLLECTION_SCHEMA_MONGOOSE.index(
  { project_id: 1, invite_token: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
)

export const inviteModel = mongoose.model(INVITE_COLLECTION_NAME, INVITE_COLLECTION_SCHEMA_MONGOOSE)
