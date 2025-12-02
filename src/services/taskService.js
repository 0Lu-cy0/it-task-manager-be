import { projectService } from '~/services/projectService'
import { taskRepository } from '~/repository/taskRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import { syncTaskToMeili, deleteTaskFromMeili } from '~/repository/searchRepository'
import { columnRepository } from '~/repository/columnRepository'
import { MESSAGES } from '~/constants/messages'
import { serverLogService } from '~/services/serverLogService'

const logTaskActivity = async (actorId, projectId, content, metadata = {}) => {
  if (!actorId || !projectId || !content) return
  try {
    await serverLogService.createLog(actorId, {
      content,
      projectId,
      logHistory:
        metadata && Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : undefined,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist task activity log', error)
  }
}

const createTask = async data => {
  const session = await mongoose.startSession()
  try {
    let task
    await session.withTransaction(async () => {
      if (!data.created_by) {
        throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.TASK_CREATED_BY_REQUIRED)
      }
      const project = await projectService.getProjectById(data.project_id)
      if (!project) {
        throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
      }
      task = await taskRepository.createTask(data, { session })

      if (data.columnId) {
        await columnRepository.addCardToColumn(data.columnId, task._id, null)
      }
      await projectService.touch(data.project_id, task.createdAt, { session })
      await syncTaskToMeili(task)
    })
    if (task) {
      await logTaskActivity(data.created_by, task.project_id, `Task "${task.title}" created`, {
        type: 'task_created',
        taskId: task._id,
        projectId: task.project_id,
      })
    }
    return task
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const updateTask = async (taskId, updateData, userId) => {
  const session = await mongoose.startSession()
  try {
    let updatedTask
    await session.withTransaction(async () => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.TASK_NOT_FOUND)
      }
      updatedTask = await taskRepository.updateTask(taskId, updateData, { session })
      await projectService.touch(task.project_id, updatedTask.updatedAt, { session })
      await syncTaskToMeili(updatedTask)
    })
    if (updatedTask && userId) {
      await logTaskActivity(userId, updatedTask.project_id, `Task "${updatedTask.title}" updated`, {
        type: 'task_updated',
        taskId: updatedTask._id,
        changedFields: Object.keys(updateData || {}),
      })
    }
    return updatedTask
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const deleteTask = async (taskId, userId) => {
  const session = await mongoose.startSession()
  try {
    let task
    await session.withTransaction(async () => {
      task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.TASK_NOT_FOUND)
      }

      if (task.columnId) {
        await columnRepository.removeCardFromColumn(task.columnId, taskId)
      }

      await taskRepository.deleteTask(taskId, { session })
      await projectService.recomputeLastActivity(task.project_id, { session })
      await deleteTaskFromMeili(taskId)
    })
    if (task && userId) {
      await logTaskActivity(userId, task.project_id, `Task "${task.title}" deleted`, {
        type: 'task_deleted',
        taskId,
      })
    }
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
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.TASK_NOT_FOUND)
  }
  return task
}

const getTasks = async (filters = {}) => {
  const tasks = await taskRepository.findTasks(filters)
  return tasks
}

const assignTask = async (taskId, assignData, actorId) => {
  const session = await mongoose.startSession()
  try {
    let updatedTask
    await session.withTransaction(async () => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.TASK_NOT_FOUND)
      }
      const isAlreadyAssigned = task.assignees.some(
        a => a.user_id._id.toString() === assignData.user_id.toString()
      )
      if (isAlreadyAssigned) {
        throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.TASK_USER_ALREADY_ASSIGNED)
      }
      updatedTask = await taskRepository.assignTask(taskId, assignData, { session })
      await projectService.touch(task.project_id, new Date(), { session })
      await syncTaskToMeili(updatedTask)
    })
    if (updatedTask && actorId) {
      await logTaskActivity(actorId, updatedTask.project_id, `Assigned user ${assignData.user_id} to task "${updatedTask.title}"`, {
        type: 'task_assigned',
        taskId: updatedTask._id,
        assigneeId: assignData.user_id,
        roleId: assignData.role_id,
      })
    }
    return updatedTask
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const unassignTask = async (taskId, assignData, actorId) => {
  const session = await mongoose.startSession()
  try {
    let updatedTask
    await session.withTransaction(async () => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.TASK_NOT_FOUND)
      }
      const isAlreadyAssigned = task.assignees.some(
        a => a.user_id._id.toString() === assignData.user_id.toString()
      )
      if (!isAlreadyAssigned) {
        throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.TASK_USER_NOT_ASSIGNED)
      }
      updatedTask = await taskRepository.unassignTask(taskId, assignData, { session })
      await projectService.touch(task.project_id, new Date(), { session })
      await syncTaskToMeili(updatedTask)
    })
    if (updatedTask && actorId) {
      await logTaskActivity(actorId, updatedTask.project_id, `Removed user ${assignData.user_id} from task "${updatedTask.title}"`, {
        type: 'task_unassigned',
        taskId: updatedTask._id,
        assigneeId: assignData.user_id,
      })
    }
    return updatedTask
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const updateTaskStatus = async (taskId, data, actorId) => {
  const nextStatus = typeof data === 'string' ? data : data?.status
  if (!nextStatus) {
    throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.TASK_STATUS_REQUIRED)
  }
  const session = await mongoose.startSession()
  try {
    let updatedTask
    let previousTask
    await session.withTransaction(async () => {
      const task = await taskRepository.getTaskById(taskId)
      if (!task) {
        throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.TASK_NOT_FOUND)
      }
      previousTask = task
      updatedTask = await taskRepository.updateTaskStatus(taskId, nextStatus, { session })
      await projectService.touch(task.project_id, updatedTask.updatedAt, { session })
      await syncTaskToMeili(updatedTask)
    })
    if (actorId && previousTask) {
      await logTaskActivity(
        actorId,
        previousTask.project_id,
        `Task "${previousTask.title}" changed status to ${nextStatus}`,
        {
          type: 'task_status_changed',
          taskId: previousTask._id,
          from: previousTask.status,
          to: nextStatus,
        }
      )
    }
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
