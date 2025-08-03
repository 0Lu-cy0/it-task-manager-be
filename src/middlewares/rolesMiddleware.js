import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { projectModel } from '~/models/projectModel'
import { projectRolesModel } from '~/models/projectRolesModel'

// /**
//  * Kiểm tra quyền admin hệ thống (giả định quyền `manage_system_roles`)
//  * @param {Object} req - Yêu cầu từ client
//  * @param {Object} res - Phản hồi tới client
//  * @param {Function} next - Middleware tiếp theo
//  */
// const checkSystemAdmin = async (req, res, next) => {
//   const userId = req.user._id
//   // Giả định có một cơ chế kiểm tra quyền admin hệ thống
//   // Ví dụ: kiểm tra trong collection Users hoặc một quyền đặc biệt
//   const user = await authModel.findById(userId).lean()
//   if (!user || !user.is_system_admin) { // Giả định có trường is_system_admin
//     throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ admin hệ thống mới có quyền truy cập')
//   }
//   next()
// }

/**
 * Kiểm tra quyền trong dự án
 * @param {string} permissionName - Tên quyền cần kiểm tra (ví dụ: change_member_role)
 * @returns {Function} Middleware
 */
const checkProjectPermission = (permissionName) => {
  return async (req, res, next) => {
    const userId = req.user._id
    const projectId = req.params.projectId || req.body.project_id
    const project = await projectModel.findOne({ _id: projectId, 'members.user_id': userId }).lean()
    if (!project) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không thuộc dự án này')
    }
    const member = project.members.find(member => member.user_id.toString() === userId.toString())
    const role = await projectRolesModel.findOne({ _id: member.role_id }).populate('permissions').lean()
    if (!role) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Vai trò không tồn tại')
    }
    const hasPermission = role.permissions.some(perm => perm.name === permissionName)
    if (!hasPermission) {
      throw new ApiError(StatusCodes.FORBIDDEN, `Bạn không có quyền ${permissionName}`)
    }
    next()
  }
}

export const rolesMiddleware = {
  // checkSystemAdmin,
  checkProjectPermission,
}
