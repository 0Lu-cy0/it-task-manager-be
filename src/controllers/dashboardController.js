import { StatusCodes } from 'http-status-codes'
import { dashboardService } from '~/services/dashboardService'
import { dashboardValidation } from '~/validations/dashboardValidation'

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

const getProjectSummary = async (req, res, next) => {
  try {
    const { projectId } = dashboardValidation.validateProjectParams(req.params)
    const summaryQuery = dashboardValidation.validateSummaryQuery(req.query)
    const data = await dashboardService.getProjectSummary(req.user._id, {
      projectId,
      ...summaryQuery,
    })
    res.status(StatusCodes.OK).json({
      message: 'Lấy dữ liệu tổng quan thành công',
      data,
    })
  } catch (error) {
    next(error)
  }
}

const getTeamWorkload = async (req, res, next) => {
  try {
    const { projectId } = dashboardValidation.validateProjectParams(req.params)
    const workloadQuery = dashboardValidation.validateWorkloadQuery(req.query)
    const data = await dashboardService.getTeamWorkload(req.user._id, {
      projectId,
      ...workloadQuery,
    })
    res.status(StatusCodes.OK).json({
      message: 'Lấy workload thành viên thành công',
      data,
    })
  } catch (error) {
    next(error)
  }
}

const getProjectActivity = async (req, res, next) => {
  try {
    const { projectId } = dashboardValidation.validateProjectParams(req.params)
    const activityQuery = dashboardValidation.validateActivityQuery(req.query)
    const data = await dashboardService.getProjectActivity(req.user._id, {
      projectId,
      ...activityQuery,
    })
    res.status(StatusCodes.OK).json({
      message: 'Lấy activity feed thành công',
      data,
    })
  } catch (error) {
    next(error)
  }
}

export const dashboardController = {
  getAllInfor,
  getRecentProject,
  getProjectSummary,
  getTeamWorkload,
  getProjectActivity,
}
