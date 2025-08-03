import { defaultRolesRepository } from '~/repository/defaultRolesRepository'

/**
 * Lấy tất cả vai trò mặc định
 * @returns {Array} Danh sách vai trò mặc định
 */
const getAllDefaultRoles = async () => {
  return await defaultRolesRepository.findAll()
}

// /**
//  * Tạo vai trò mặc định mới (chỉ dành cho admin hệ thống)
//  * @param {Object} data - Dữ liệu vai trò
//  * @returns {Object} Vai trò đã được tạo
//  */
// const createDefaultRole = async (data) => {
//   const validatedData = await defaultRolesValidation.validateBeforeCreate(data)
//   return await defaultRolesRepository.create(validatedData)
// }

// /**
//  * Cập nhật vai trò mặc định (chỉ dành cho admin hệ thống)
//  * @param {string} id - ID vai trò
//  * @param {Object} data - Dữ liệu cập nhật
//  * @returns {Object} Vai trò đã được cập nhật
//  */
// const updateDefaultRole = async (id, data) => {
//   const validatedData = await defaultRolesValidation.validateUpdate(data)
//   return await defaultRolesRepository.update(id, validatedData)
// }

export const defaultRolesService = {
  getAllDefaultRoles,
  // createDefaultRole,
  // updateDefaultRole,
}
