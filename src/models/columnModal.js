import mongoose from 'mongoose'
const { Schema } = mongoose

const ColumnSchema = new Schema(
  {
    title: { type: String, required: true },
    project_id: { type: Schema.Types.ObjectId, ref: 'projects', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    cardOrderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tasks' }], // lưu order
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)
ColumnSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export const ColumnModel = mongoose.model('column', ColumnSchema)
export const COLUMN_COLLECTION_NAME = 'column'
