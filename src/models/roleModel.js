import mongoose from 'mongoose'

export const ROLE_COLLECTION_NAME = 'roles'

const ROLE_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String, default: [] }],
  description: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const roleModel = mongoose.model(
  ROLE_COLLECTION_NAME,
  ROLE_COLLECTION_SCHEMA_MONGOOSE,
)
