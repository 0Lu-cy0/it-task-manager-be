import { StatusCodes } from 'http-status-codes'
import { projectRolesService } from '~/services/projectRolesService'

/**
 * Lấy tất cả vai trò của một dự án
 * @param {Object} req - Yêu cầu từ client
 * @param {Object} res - Phản hồi tới client
 * @param {Function} next - Middleware tiếp theo
 */
const getAll = async (req, res, next) => {
  try {
    const roles = await projectRolesService.getProjectRoles(req.params.projectId)
    res.status(StatusCodes.OK).json({ message: 'Lấy vai trò dự án thành công', data: roles })
  } catch (error) {
    next(error)
  }
}

/**
 * Cập nhật vai trò dự án
 * @param {Object} req - Yêu cầu từ client
 * @param {Object} res - Phản hồi tới client
 * @param {Function} next - Middleware tiếp theo
 */
const update = async (req, res, next) => {
  try {
    const role = await projectRolesService.updateProjectRole(req.params.id, req.body)
    res.status(StatusCodes.OK).json({ message: 'Cập nhật vai trò dự án thành công', data: role })
  } catch (error) {
    next(error)
  }
}

export const projectRolesController = {
  getAll,
  update,
}
