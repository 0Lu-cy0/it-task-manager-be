import { projectRolesModel } from '~/models/projectRolesModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

/**
 * Lấy tất cả vai trò của một dự án
 * @param {string} projectId - ID của dự án
 * @returns {Array} Danh sách vai trò
 */
const findByProjectId = async (projectId) => {
  return await projectRolesModel
    .find({ project_id: projectId, _destroy: false })
    .populate('permissions')
    .lean()
    .exec()
}

// /**
//  * Tạo vai trò dự án mới
//  * @param {Object} data - Dữ liệu vai trò
//  * @returns {Object} Vai trò đã được tạo
//  * @throws {ApiError} Nếu vai trò đã tồn tại trong dự án
//  */
// const create = async (data) => {
//   const existingRole = await projectRolesModel.findOne({
//     project_id: data.project_id,
//     name: data.name,
//     _destroy: false,
//   }).lean()
//   if (existingRole) {
//     throw new ApiError(StatusCodes.CONFLICT, 'Vai trò đã tồn tại trong dự án')
//   }
//   return await projectRolesModel.create(data)
// }

/**
 * Cập nhật vai trò dự án
 * @param {string} id - ID vai trò
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Object} Vai trò đã được cập nhật
 * @throws {ApiError} Nếu vai trò không tồn tại
 */
const update = async (id, data) => {
  const role = await projectRolesModel
    .findOneAndUpdate({ _id: id, _destroy: false }, { $set: data }, { new: true })
    .populate('permissions')
    .lean()
  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại')
  }
  return role
}

export const projectRolesRepository = {
  findByProjectId,
  // create,
  update,
}
