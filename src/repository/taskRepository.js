import { TaskModel } from '~/models/taskModel'

const createTask = async (taskData) => {
  const task = new TaskModel(taskData)
  return task.save()
}

const updateTask = async (taskId, updateData) => {
  const task = await TaskModel.findByIdAndUpdate(
    taskId,
    { ...updateData, updated_at: Date.now() },
    { new: true },
  )
  return task
}

const deleteTask = async (taskId) => {
  const task = await TaskModel.findByIdAndUpdate(
    taskId,
    { _destroy: true, updated_at: Date.now() },
    { new: true },
  )
  return task
}

const getTaskById = async (taskId) => {
  return TaskModel.findById(taskId)
    .populate('assignees.user_id', 'username full_name avatar_url')
    .populate('created_by', 'username full_name')
}

const findTasks = async (query = {}) => {
  return TaskModel.find({ _destroy: false, ...query })
    .populate('assignees.user_id', 'username full_name avatar_url')
    .populate('created_by', 'username full_name')
    .sort({ created_at: -1 })
}

const assignTask = async (taskId, assigneeData) => {
  const task = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      $push: { assignees: assigneeData },
      updated_at: Date.now(),
    },
    { new: true },
  ).populate('assignees.user_id', 'username full_name avatar_url')

  return task
}

const updateTaskStatus = async (taskId, status) => {
  const updateData = {
    status,
    updated_at: Date.now(),
  }

  if (status === 'completed') {
    updateData.completed_at = Date.now()
  }

  const task = await TaskModel.findByIdAndUpdate(
    taskId,
    updateData,
    { new: true },
  )
  return task
}

export const taskRepository = {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  findTasks,
  assignTask,
  updateTaskStatus,
}
