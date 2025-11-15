import { taskModel } from '~/models/taskModel'

/**
 * Tạo một task mới
 */
const createTask = async (taskData, options = {}) => {
  const task = new taskModel(taskData)
  return await task.save(options)
}

/**
 * Cập nhật thông tin task
 */
const updateTask = async (taskId, updateData, options = {}) => {
  return await taskModel.findByIdAndUpdate(
    taskId,
    { ...updateData, updated_at: Date.now() },
    { new: true, ...options }
  )
}

/**
 * Xóa mềm task
 */
const deleteTask = async (taskId, options = {}) => {
  return await taskModel.findByIdAndUpdate(
    taskId,
    { _destroy: true, updated_at: Date.now() },
    { new: true, ...options }
  )
}

/**
 * Lấy thông tin task theo ID
 */
const getTaskById = async taskId => {
  return await taskModel
    .findById(taskId)
    .populate('assignees.user_id', 'username full_name avatar_url')
    .populate('created_by', 'username full_name')
    .lean()
}

/**
 * Tìm kiếm danh sách task
 */
const findTasks = async (query = {}) => {
  return await taskModel
    .find({ _destroy: false, ...query })
    .populate('assignees.user_id', 'username full_name avatar_url')
    .populate('created_by', 'username full_name')
    .sort({ created_at: -1 })
    .lean()
}

/**
 * Gán người dùng vào task
 */
const assignTask = async (taskId, assigneeData, options = {}) => {
  return await taskModel
    .findByIdAndUpdate(
      taskId,
      {
        $push: { assignees: assigneeData },
        updated_at: Date.now(),
      },
      { new: true, ...options }
    )
    .populate('assignees.user_id', 'username full_name avatar_url')
}

/**
 * Bỏ gán người dùng khỏi task
 */
const unassignTask = async (taskId, assigneeData, options = {}) => {
  return await taskModel
    .findByIdAndUpdate(
      taskId,
      {
        $pull: { assignees: assigneeData },
        updated_at: Date.now(),
      },
      { new: true, ...options }
    )
    .populate('assignees.user_id', 'username full_name avatar_url')
}

/**
 * Cập nhật trạng thái task
 */
const updateTaskStatus = async (taskId, status, options = {}) => {
  const updateData = {
    status,
    updated_at: Date.now(),
  }
  if (status === 'completed') {
    updateData.completed_at = Date.now()
  }
  return await taskModel.findByIdAndUpdate(taskId, updateData, { new: true, ...options })
}

const findByColumnId = async (columnId, options = {}) => {
  const tasks = await taskModel
    .find({
      columnId: columnId,
      _destroy: false,
    })
    .session(options.session || null)
    .lean()
    .exec()
  return tasks
}

const deleteByColumnId = async (columnId, options = {}) => {
  const result = await taskModel
    .updateMany({ columnId: columnId }, { $set: { _destroy: true } })
    .session(options.session || null)
    .exec()

  return result
}

const updateById = async (taskId, updateData, options = {}) => {
  return await taskModel
    .findByIdAndUpdate(taskId, { ...updateData, updated_at: Date.now() }, { new: true, ...options })
    .session(options.session || null)
    .exec()
}

export const taskRepository = {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  findTasks,
  assignTask,
  unassignTask,
  updateTaskStatus,
  findByColumnId,
  deleteByColumnId,
  updateById,
}
