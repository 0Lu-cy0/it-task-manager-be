import { StatusCodes } from 'http-status-codes'
import { dashboardService } from '~/services/dashboardService'

const getTotalProject = async (req, res, next) => {
  try {
    const userId = req.params.id
    //Điều hướng dữ liệu sang tầng service
    const totalProject = await dashboardService.getTotalProject(userId)
    //Có kết quả trả về phía client
    res.status(StatusCodes.OK).json(totalProject)
  } catch (error) {
    next(error)
  }
}

export const projectController = {
  getTotalProject,
}
