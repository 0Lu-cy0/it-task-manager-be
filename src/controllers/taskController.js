import { StatusCodes } from 'http-status-codes'
import { taskService } from '~/services/taskService'
import { taskValidation } from '~/validations/taskValidation'

const createTask = async (req, res, next) => {
  try {
    const validatedData = await taskValidation.validateCreate(req.body)
    const result = await taskService.createTask({ ...validatedData, created_by: req.user._id })

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
    const validatedData = await taskValidation.validateUpdate(req.body)
    const result = await taskService.updateTask(id, validatedData)

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
      assignee: req.query.assignee,
    }

    const result = await taskService.getTasks(filters)

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
    const validatedData = await taskValidation.validateAssign(req.body)
    const result = await taskService.assignTask(id, {
      ...validatedData,
      assigned_by: req.user._id,
    })

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Task assigned successfully',
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
  updateTaskStatus,
}
