/* eslint-disable no-useless-catch */
// import { slugify } from '~/utils/formater'
import { dashboardRepository } from '~/repository/dashboardRepository'

const getAllInfor = async userId => {
  return await dashboardRepository.findAll(userId)
}
const getRecentProject = async userId => {
  return await dashboardRepository.lastProjectActivity(userId)
}

export const dashboardService = {
  getAllInfor,
  getRecentProject,
}
