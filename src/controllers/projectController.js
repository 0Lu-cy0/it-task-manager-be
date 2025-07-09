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
export const projectController = {
  createNew,
}
