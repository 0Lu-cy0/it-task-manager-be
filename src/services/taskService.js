import { projectService } from '~/services/projectService'
import { taskRepository } from '~/repository/taskRepository'
import { APIError } from '~/utils/APIError'
import { StatusCodes } from 'http-status-codes'

const createTask = async (data) => {
  // Check if project exists and user has permission
  const project = await projectService.getProjectById(data.project_id)
  if (!project) {
    throw new APIError('Project not found', StatusCodes.NOT_FOUND)
  }

  // Create the task using repository
  const task = await taskRepository.createTask(data)
  return task
}

const updateTask = async (taskId, updateData) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new APIError('Task not found', StatusCodes.NOT_FOUND)
  }

  // Update task using repository
  const updatedTask = await taskRepository.updateTask(taskId, updateData)
  return updatedTask
}

const deleteTask = async (taskId) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new APIError('Task not found', StatusCodes.NOT_FOUND)
  }

  await taskRepository.deleteTask(taskId)
  return true
}

const getTaskById = async (taskId) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new APIError('Task not found', StatusCodes.NOT_FOUND)
  }
  return task
}

const getTasks = async (filters = {}) => {
  const tasks = await taskRepository.findTasks(filters)
  return tasks
}

const assignTask = async (taskId, assignData) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new APIError('Task not found', StatusCodes.NOT_FOUND)
  }

  const updatedTask = await taskRepository.assignTask(taskId, assignData)
  return updatedTask
}

const updateTaskStatus = async (taskId, status) => {
  const task = await taskRepository.getTaskById(taskId)
  if (!task) {
    throw new APIError('Task not found', StatusCodes.NOT_FOUND)
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
  updateTaskStatus,
}
