/* eslint-disable no-useless-catch */
// import { slugify } from '~/utils/formater'
import { dashboardModel } from '~/models/dashboardModel'
import ApiError from '~/utils/APIError'
import { StatusCodes } from 'http-status-codes'

const getTotalProject = async (userId) => {
  try {
    const dashboard = await dashboardModel.getTotalProject(userId)
    if (!userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not Found Project')
    }
    return dashboard //Trả về cho controller những dữ liệu cần thiết cho phía client bên fe,
    //trong service luôn phải có return
  } catch (error) {
    throw error
  }
}

export const dashboardService = {
  getTotalProject,
}
