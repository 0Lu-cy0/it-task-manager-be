import { StatusCodes } from 'http-status-codes'
import { projectService } from '~/services/projectService'

const createNew = async (req, res, next) => {
  try {
    //Điều hướng dữ liệu sang tầng service
    const createdProject = await projectService.createNew(req.body)
    //Có kết quả trả về phía client
    res.status(StatusCodes.CREATED).json(createdProject)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    const projectId = req.params.id
    //Điều hướng dữ liệu sang tầng service
    const project = await projectService.getDetails(projectId)
    //Có kết quả trả về phía client
    res.status(StatusCodes.OK).json(project)
  } catch (error) {
    next(error)
  }
}

export const projectController = {
  createNew,
  getDetails,
}
