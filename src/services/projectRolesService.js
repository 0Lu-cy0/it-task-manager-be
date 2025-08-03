import { projectRolesRepository } from '~/repository/projectRolesRepository'
import { projectRolesValidation } from '~/validations/projectRolesValidation'

// /**
//  * Tạo vai trò dự án khi tạo dự án mới
//  * @param {string} projectId - ID của dự án
//  * @returns {Array} Danh sách vai trò dự án được tạo
//  */
// const createProjectRoles = async (projectId) => {
//   const defaultRoles = await defaultRolesService.getAllDefaultRoles()
//   if (!defaultRoles || defaultRoles.length === 0) {
//     throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không tìm thấy vai trò mặc định')
//   }
//   //Tạo mảng projectRoles mới chứa các thuộc tính được ánh xạ từ defaultRoles bằng phương thức map
//   const projectRoles = defaultRoles.map((role) => ({
//     project_id: projectId,
//     default_role_id: role._id,
//     name: role.name,
//     permissions: role.permissions,
//     created_at: new Date(),
//     updated_at: new Date(),
//     _destroy: false,
//   }))

//   return await projectRolesRepository.create(projectRoles)
// }

/**
 * Lấy tất cả vai trò của một dự án
 * @param {string} projectId - ID của dự án
 * @returns {Array} Danh sách vai trò
 */
const getProjectRoles = async (projectId) => {
  return await projectRolesRepository.findByProjectId(projectId)
}

/**
 * Cập nhật vai trò dự án
 * @param {string} id - ID vai trò
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Object} Vai trò đã được cập nhật
 */
const updateProjectRole = async (id, data) => {
  const validatedData = await projectRolesValidation.validateUpdate(data)
  return await projectRolesRepository.update(id, validatedData)
}

export const projectRolesService = {
  // createProjectRoles,
  getProjectRoles,
  updateProjectRole,
}
