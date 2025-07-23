import mongoose from 'mongoose'

export const CHATCONTACT_COLLECTION_NAME = 'chatcontacts'

const CHATCONTACT_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  contact_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  added_at: { type: Date, default: Date.now },
  _destroy: { type: Boolean, default: false },
}).pre('save', function (next) {
  this.updated_at = Date.now()
  next()
})

export const chatContactModel = mongoose.model(
  CHATCONTACT_COLLECTION_NAME,
  CHATCONTACT_COLLECTION_SCHEMA_MONGOOSE,
)
