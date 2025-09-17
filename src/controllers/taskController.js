import { StatusCodes } from 'http-status-codes'
import { taskService } from '~/services/taskService'
import { taskValidation } from '~/validations/taskValidation'

const createTask = async (req, res, next) => {
  try {
    console.log(req.params.projectId)
    const result = await taskService.createTask({ ...req.body, created_by: req.user._id, project_id: req.params.projectId })

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Task created successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const dataUpdate = req.body
    const result = await taskService.updateTask(id, dataUpdate)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Task updated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params
    await taskService.deleteTask(id)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Task deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await taskService.getTaskById(id)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const getTasks = async (req, res, next) => {
  try {
    const filters = {
      project_id: req.query.project_id,
      status: req.query.status,
      priority: req.query.priority,
      assignees: req.query.assignees,
    }

    // Lọc các field undefined trong khi gọi service
    const cleanFilters = {}
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined) {
        cleanFilters[key] = filters[key]
      }
    })

    const result = await taskService.getTasks(cleanFilters)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const assignTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const dataAssign = req.body
    const result = await taskService.assignTask(id, { ...dataAssign, assigned_by: req.user._id })

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Task assigned successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const unassignTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const dataUnassign = req.body
    const result = await taskService.unassignTask(id, dataUnassign)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Task unassigned successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = await taskValidation.validateStatusUpdate(req.body)
    const result = await taskService.updateTaskStatus(id, status)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Task status updated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const taskController = {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getTasks,
  assignTask,
  unassignTask,
  updateTaskStatus,
}
