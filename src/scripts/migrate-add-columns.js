import mongoose from 'mongoose'
import { CONNECT_DB, CLOSE_DB } from '../config/mongodb'
import { projectModel } from '../models/projectModel'
import { taskModel } from '../models/taskModel'
import { ColumnModel } from '../models/columnModel'

async function run() {
  await CONNECT_DB()
  try {
    const projects = await projectModel.find({}).lean()
    for (const p of projects) {
      const existing = await ColumnModel.findOne({ project_id: p._id })
      let column
      if (existing) {
        column = existing
        // kiểm tra p.columns có tồn tại và là array
        if (
          !Array.isArray(p?.columns) ||
          !p.columns.find(id => String(id) === String(column._id))
        ) {
          await projectModel.updateMany({ columns: { $exists: false } }, { $set: { columns: [] } })
        }
      } else {
        // lấy createdBy từ project (owner/creator/memberIds[0]) hoặc fallback
        const createdBy =
          p.owner ||
          p.createdBy ||
          p.creator ||
          (Array.isArray(p.memberIds) && p.memberIds[0]) ||
          p._id // fallback dùng project._id

        column = await ColumnModel.create({
          title: 'To Do',
          project_id: p._id,
          cardOrderIds: [],
          createdBy: new mongoose.Types.ObjectId(createdBy),
        })
        await projectModel.updateOne({ _id: p._id }, { $addToSet: { columns: column._id } })
        console.log(`Created default column ${column._id} for project ${p._id}`)
      }

      // gán tasks chưa có columnId
      const res = await taskModel.updateMany(
        { projectId: p._id, $or: [{ columnId: null }, { columnId: { $exists: false } }] },
        { $set: { columnId: column._id } }
      )
      if (res.modifiedCount) {
        console.log(
          `Assigned ${res.modifiedCount} tasks to column ${column._id} for project ${p._id}`
        )
      }
    }
    console.log('Migration finished')
  } catch (err) {
    console.error('Migration error', err)
  } finally {
    await CLOSE_DB()
    process.exit(0)
  }
}

run()
