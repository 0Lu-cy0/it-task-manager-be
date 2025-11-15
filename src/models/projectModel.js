import mongoose from 'mongoose'
import { projectRolesModel } from '~/models/projectRolesModel'

export const PROJECT_COLLECTION_NAME = 'projects'

const PROJECT_COLLECTION_SCHEMA_MONGOOSE = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 5, maxlength: 50, trim: true, index: true },
    description: { type: String, default: null },
    status: {
      type: String,
      required: true,
      enum: ['planning', 'in_progress', 'testing', 'completed'],
      index: true,
    },
    columns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'column' }],
    priority: { type: String, required: true, enum: ['low', 'medium', 'high'], index: true },
    start_date: { type: Date, default: null },
    end_date: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return !this.start_date || !value || value > this.start_date
        },
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
      },
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    members: {
      type: [
        {
          user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
            index: true,
          },
          project_role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'project_roles',
            required: true,
          },
          joined_at: { type: Date, default: Date.now },
          _id: false,
        },
      ],
      default: [],
    },
    member_count: { type: Number, default: 0 },
    last_activity: { type: Date, default: Date.now, index: true },
    _destroy: { type: Boolean, default: false },
    free_mode: { type: Boolean, default: false },
    visibility: {
      type: String,
      required: true,
      enum: ['private', 'public'],
      default: 'private',
      index: true,
    },
  },
  { timestamps: true }
)

/**
 * Middleware validate: check members
 * - Không cho user_id trùng lặp
 * - Chỉ cho phép tối đa 1 lead
 */
PROJECT_COLLECTION_SCHEMA_MONGOOSE.pre('validate', async function (next) {
  if (!this.members || this.members.length === 0) return next()

  // Check duplicate user_id
  const userIds = this.members.map(m => m.user_id.toString())
  const uniqueUserIds = new Set(userIds)
  if (uniqueUserIds.size !== userIds.length) {
    return next(new Error('Một user_id chỉ được phép xuất hiện một lần trong mảng members'))
  }

  // Check lead count
  const leadRoleIds = (await projectRolesModel.find({ project_id: this._id, name: 'lead' })).map(
    role => role._id.toString()
  )
  const leadCount = this.members.filter(m =>
    leadRoleIds.includes(m.project_role_id.toString())
  ).length
  if (leadCount > 1) {
    return next(new Error('Chỉ được phép có tối đa một lead trong dự án'))
  }

  next()
})

/**
 * Middleware save: đồng bộ member_count
 */
PROJECT_COLLECTION_SCHEMA_MONGOOSE.pre('save', function (next) {
  const uniqueUserIds = new Set(this.members.map(m => m.user_id.toString()))
  this.member_count = uniqueUserIds.size
  next()
})

/**
 * Middleware update: check khi thêm/cập nhật members
 */
PROJECT_COLLECTION_SCHEMA_MONGOOSE.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate()
  if (!update) return next()

  const project = await this.model.findById(this.getQuery()._id)
  if (!project) return next()

  let newMembers = []
  if (update.$push && update.$push.members) {
    newMembers = Array.isArray(update.$push.members) ? update.$push.members : [update.$push.members]
  }
  if (update.$set && update.$set.members) {
    newMembers = Array.isArray(update.$set.members) ? update.$set.members : [update.$set.members]
  }

  if (newMembers.length > 0) {
    const newUserIds = newMembers.map(m => m.user_id.toString())
    const existingUserIds = project.members.map(m => m.user_id.toString())
    if (newUserIds.some(id => existingUserIds.includes(id))) {
      return next(
        new Error('Một user_id chỉ được phép xuất hiện một lần trong mảng members (Dòng 102)')
      )
    }

    const leadRoleIds = (
      await projectRolesModel.find({ project_id: project._id, name: 'lead' })
    ).map(role => role._id.toString())
    const currentLeads = project.members.filter(m =>
      leadRoleIds.includes(m.project_role_id.toString())
    ).length
    const newLeads = newMembers.filter(m =>
      leadRoleIds.includes(m.project_role_id.toString())
    ).length
    if (currentLeads + newLeads > 1) {
      return next(new Error('Chỉ được phép có tối đa một lead trong dự án'))
    }
  }

  next()
})

/**
 * Virtual populate tasks
 */
PROJECT_COLLECTION_SCHEMA_MONGOOSE.virtual('tasks', {
  ref: 'tasks',
  localField: '_id',
  foreignField: 'projectId',
})

// Bật virtual khi convert sang JSON hoặc Object
PROJECT_COLLECTION_SCHEMA_MONGOOSE.set('toObject', { virtuals: true })
PROJECT_COLLECTION_SCHEMA_MONGOOSE.set('toJSON', { virtuals: true })

PROJECT_COLLECTION_SCHEMA_MONGOOSE.index({ last_activity: -1 })

PROJECT_COLLECTION_SCHEMA_MONGOOSE.statics.safeAbortTransaction = async function (session) {
  if (session && session.inTransaction()) {
    try {
      await session.abortTransaction()
    } catch (error) {
      // Ignore if transaction was already aborted
      if (!error.message.includes('Cannot call abortTransaction twice')) {
        throw error
      }
    }
  }
}

export const projectModel = mongoose.model(
  PROJECT_COLLECTION_NAME,
  PROJECT_COLLECTION_SCHEMA_MONGOOSE
)
