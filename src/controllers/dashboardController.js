import { StatusCodes } from 'http-status-codes'
import { dashboardService } from '~/services/dashboardService'

const getAllInfor = async (req, res, next) => {
  try {
    const userId = req.user._id
    //Điều hướng dữ liệu sang tầng service
    const infor = await dashboardService.getAllInfor(userId)
    //Có kết quả trả về phía client
    res.status(StatusCodes.OK).json(infor)
  } catch (error) {
    next(error)
  }
}

const getRecentProject = async (req, res, next) => {
  try {
    const userId = req.user._id
    const recent = await dashboardService.getRecentProject(userId)
    res.status(StatusCodes.OK).json(recent)
  } catch (error) {
    next(error)
  }
}

export const dashboardController = {
  getAllInfor,
  getRecentProject,
}
