import { StatusCodes } from 'http-status-codes'
import { projectService } from '~/services/projectService'
import { MESSAGES } from '~/constants/messages'
import winston from 'winston'

const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: 'project.log' })],
})

const createNew = async (req, res, next) => {
  try {
    const result = await projectService.createNew({
      ...req.body,
      created_by: req.user._id,
    })
    logger.info(`Dự án mới được tạo bởi ${req.user._id}: ${result._id}`)
    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: MESSAGES.PROJECT_CREATED,
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi tạo dự án: ${error.message}`)
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const result = await projectService.updateProject(projectId, req.body)
    logger.info(`Dự án ${projectId} được cập nhật bởi ${req.user._id}`)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: MESSAGES.PROJECT_UPDATED,
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi cập nhật dự án ${req.params.projectId}: ${error.message}`)
    next(error)
  }
}

const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const deleted = projectService.deleteProject(projectId)
    if (!deleted) {
      res.status(StatusCodes.NOT_FOUND).json({
        status: 'error',
        message: MESSAGES.PROJECT_NOT_FOUND,
      })
    } else {
      res.status(StatusCodes.OK).json({
        status: 'success',
        message: MESSAGES.PROJECT_DELETED,
      })
    }
  } catch (error) {
    logger.error(`Lỗi khi xóa dự án ${req.params.projectId}: ${error.message}`)
    next(error)
  }
}

const getAllProjects = async (req, res, next) => {
  try {
    const result = await projectService.getAll(req.user._id, req.query)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Danh sách dự án được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy danh sách dự án: ${error.message}`)
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const userId = req.user?._id // Lấy userId từ auth middleware
    const result = await projectService.getProjectById(projectId, userId)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Dự án được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

const addProjectMember = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.addProjectMember(id, req.body, req.user._id)
    logger.info(`Thêm thành viên vào dự án ${id} bởi ${req.user._id}`)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Thêm thành viên thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi thêm thành viên vào dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params
    await projectService.removeProjectMember(id, userId, req.user._id)
    logger.info(`Xóa thành viên ${userId} khỏi dự án ${id} bởi ${req.user._id}`)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Xóa thành viên thành công',
    })
  } catch (error) {
    logger.error(
      `Lỗi khi xóa thành viên ${req.params.userId} khỏi dự án ${req.params.id}: ${error.message}`
    )
    next(error)
  }
}

const updateMemberRole = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const { change } = req.body
    const result = await projectService.updateProjectMemberRole(projectId, change)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Cập nhật vai trò thành viên thành công',
      data: result,
    })
  } catch (error) {
    logger.error(
      `Lỗi khi cập nhật vai trò thành viên ${req.params.userId} trong dự án ${req.params.id}: ${error.message}`
    )
    next(error)
  }
}

const getProjectRoles = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.getProjectRoles(id)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Danh sách vai trò được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy danh sách vai trò của dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

const getProjectMembers = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const result = await projectService.getProjectMembers(projectId)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Danh sách thành viên được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy danh sách thành viên của dự án ${req.params.projectId}: ${error.message}`)
    next(error)
  }
}

const getProjectLead = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await projectService.getProjectLead(id)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Thông tin lead được lấy thành công',
      data: result,
    })
  } catch (error) {
    logger.error(`Lỗi khi lấy thông tin lead của dự án ${req.params.id}: ${error.message}`)
    next(error)
  }
}

const toggleFreeMode = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const { free_mode } = req.body
    const currentUserId = req.user._id

    const updatedProject = await projectService.toggleFreeMode({
      projectId,
      free_mode,
      currentUserId,
    })

    res.status(StatusCodes.OK).json({
      message: 'Cập nhật free_mode thành công',
      free_mode: updatedProject.free_mode,
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
  addProjectMember,
  removeMember,
  updateMemberRole,
  getProjectRoles,
  getProjectMembers,
  getProjectLead,
  toggleFreeMode,
}
