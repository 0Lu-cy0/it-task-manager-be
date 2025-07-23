import { StatusCodes } from 'http-status-codes'
import { projectService } from '~/services/projectService'
import { projectValidation } from '~/validations/projectValidation'

const createNew = async (req, res, next) => {
  try {
    const validatedData = await projectValidation.validateBeforeCreate(req.body)
    const result = await projectService.createNew({
      ...validatedData,
      created_by: req.user._id,
    })

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Project created successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const { id } = req.params
    const validatedData = await projectValidation.validateUpdate(req.body)
    const result = await projectService.updateProject(id, validatedData)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Project updated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params
    await projectService.deleteProject(id)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Project deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

const getAllProjects = async (req, res, next) => {
  try {
    const result = await projectService.getAll(req.user._id, req.query)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Projects retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.getProjectById(id)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Project retrieved successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params
    const validatedData = await projectValidation.validateAddMember(req.body)
    const result = await projectService.addProjectMember(id, validatedData)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Member added successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params
    await projectService.removeProjectMember(id, userId)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Member removed successfully',
    })
  } catch (error) {
    next(error)
  }
}

const updateMemberRole = async (req, res, next) => {
  try {
    const { id, userId } = req.params
    const validatedData = await projectValidation.validateUpdateMemberRole(req.body)
    const result = await projectService.updateProjectMemberRole(id, userId, validatedData.role_id)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Member role updated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const projectController = {
  createNew,
  update,
  deleteProject,
  getAllProjects,
  getById,
  addMember,
  removeMember,
  updateMemberRole,
}
