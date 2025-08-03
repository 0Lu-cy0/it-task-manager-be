import { defaultRolesModel } from '~/models/defaultRolesModel'

/**
 * Lấy tất cả vai trò mặc định
 * @returns {Array} Danh sách vai trò mặc định
 */
const findAll = async () => {
  return await defaultRolesModel.find({ _destroy: false }).lean().exec()
}

// /**
//  * Tạo vai trò mặc định mới
//  * @param {Object} data - Dữ liệu vai trò
//  * @returns {Object} Vai trò đã được tạo
//  * @throws {ApiError} Nếu tên vai trò đã tồn tại
//  */
// const create = async (data) => {
//   const existingRole = await defaultRolesModel.findOne({ name: data.name, _destroy: false }).lean()
//   if (existingRole) {
//     throw new ApiError(StatusCodes.CONFLICT, 'Tên vai trò đã tồn tại')
//   }
//   return await defaultRolesModel.create(data)
// }

// /**
//  * Cập nhật vai trò mặc định
//  * @param {string} id - ID vai trò
//  * @param {Object} data - Dữ liệu cập nhật
//  * @returns {Object} Vai trò đã được cập nhật
//  * @throws {ApiError} Nếu vai trò không tồn tại
//  */
// const update = async (id, data) => {
//   const role = await defaultRolesModel
//     .findOneAndUpdate({ _id: id, _destroy: false }, { $set: data }, { new: true })
//     .lean()
//   if (!role) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại')
//   }
//   return role
// }

export const defaultRolesRepository = {
  findAll,
  // create,
  // update,
}
