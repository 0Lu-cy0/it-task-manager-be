import { projectService } from '~/services/projectService'
import { taskRepository } from '~/repository/taskRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import { syncTaskToMeili, deleteTaskFromMeili } from '~/repository/searchRepository'
import { columnRepository } from '~/repository/columnRepository'

const createTask = async data => {
  const session = await mongoose.startSession()
  try {
    let task
    await session.withTransaction(async () => {
      if (!data.created_by) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'created_by is required')
      }
      const project = await projectService.getProjectById(data.project_id)
      if (!project) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found')
      }
      task = await taskRepository.createTask(data, { session })

      if (data.columnId) {
        await columnRepository.addCardToColumn(data.columnId, task._id, null)
      }
      await projectService.touch(data.project_id, task.createdAt, { session })
      await syncTaskToMeili(task)
    })
    return task
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const updateTask = async (taskId, updateData) => {
  const session = await mongoose.startSession()
  try {
    let updatedTask
    await session.withTransaction(async () => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
      }
      updatedTask = await taskRepository.updateTask(taskId, updateData, { session })
      await projectService.touch(task.project_id, updatedTask.updatedAt, { session })
      await syncTaskToMeili(updatedTask)
    })
    return updatedTask
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const deleteTask = async taskId => {
  const session = await mongoose.startSession()
  try {
    let task
    await session.withTransaction(async () => {
      task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
      }

      if (task.columnId) {
        await columnRepository.removeCardFromColumn(task.columnId, taskId)
      }

      await taskRepository.deleteTask(taskId, { session })
      await projectService.recomputeLastActivity(task.project_id, { session })
      await deleteTaskFromMeili(taskId)
    })
    return true
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const getTaskById = async taskId => {
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
  const session = await mongoose.startSession()
  try {
    let updatedTask
    await session.withTransaction(async () => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
      }
      const isAlreadyAssigned = task.assignees.some(
        a => a.user_id._id.toString() === assignData.user_id.toString()
      )
      if (isAlreadyAssigned) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'User is already assigned to this task')
      }
      updatedTask = await taskRepository.assignTask(taskId, assignData, { session })
      await projectService.touch(task.project_id, new Date(), { session })
      await syncTaskToMeili(updatedTask)
    })
    return updatedTask
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const unassignTask = async (taskId, assignData) => {
  const session = await mongoose.startSession()
  try {
    let updatedTask
    await session.withTransaction(async () => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
      }
      const isAlreadyAssigned = task.assignees.some(
        a => a.user_id._id.toString() === assignData.user_id.toString()
      )
      if (!isAlreadyAssigned) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'User is not already assigned to this task')
      }
      updatedTask = await taskRepository.unassignTask(taskId, assignData, { session })
      await projectService.touch(task.project_id, new Date(), { session })
      await syncTaskToMeili(updatedTask)
    })
    return updatedTask
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const updateTaskStatus = async (taskId, status) => {
  const session = await mongoose.startSession()
  try {
    let updatedTask
    await session.withTransaction(async () => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found')
      }
      updatedTask = await taskRepository.updateTaskStatus(taskId, status, { session })
      await projectService.touch(task.project_id, updatedTask.updatedAt, { session })
      await syncTaskToMeili(updatedTask)
    })
    return updatedTask
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
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
