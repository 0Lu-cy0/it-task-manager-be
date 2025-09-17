import { projectService } from '~/services/projectService'
import { taskRepository } from '~/repository/taskRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createTask = async (data) => {
  if (!data.created_by) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'created_by is required')
  }
  // Check if project exists and user has permission
  const project = await projectService.getProjectById(data.project_id)
  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found')
  }

  // Create the task using repository
  const task = await taskRepository.createTask(data)
  return task
}

const updateTask = async (taskId, updateData) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
  }

  // Update task using repository
  const updatedTask = await taskRepository.updateTask(taskId, updateData)
  return updatedTask
}

const deleteTask = async (taskId) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
  }

  await taskRepository.deleteTask(taskId)
  return true
}

const getTaskById = async (taskId) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
  }
  return task
}

const getTasks = async (filters = {}) => {
  const tasks = await taskRepository.findTasks(filters)
  return tasks
}

const assignTask = async (taskId, assignData) => {
  // Lấy task ra trước
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
  }

  // Kiểm tra user đã tồn tại trong assignees chưa
  const isAlreadyAssigned = task.assignees.some(
    (a) => a.user_id._id.toString() === assignData.user_id.toString(),
  )

  if (isAlreadyAssigned) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User is already assigned to this task')
  }

  // Nếu chưa thì thêm mới
  const updatedTask = await taskRepository.assignTask(taskId, assignData)
  return updatedTask
}

const unassignTask = async (taskId, assignData) => {
  // Lấy task ra trước
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
  }

  // Kiểm tra user đã tồn tại trong assignees chưa
  const isAlreadyAssigned = task.assignees.some(
    (a) => a.user_id._id.toString() === assignData.user_id.toString(),
  )

  if (!isAlreadyAssigned) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User is not already assigned to this task')
  }

  // Nếu chưa thì thêm mới
  const updatedTask = await taskRepository.unassignTask(taskId, assignData)
  return updatedTask
}

const updateTaskStatus = async (taskId, status) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
  }

  const updatedTask = await taskRepository.updateTaskStatus(taskId, status)
  return updatedTask
}

export const taskService = {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getTasks,
  assignTask,
  unassignTask,
  updateTaskStatus,
}
