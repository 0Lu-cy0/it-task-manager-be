import { projectRolesModel } from '~/models/projectRolesModel'
import { permissionModel } from '~/models/permissionModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { projectModel } from '~/models/projectModel'

/**
 * Tìm danh sách roles theo projectId
 */
const findByProjectId = async (projectId) => {
  return await projectRolesModel
    .find({ project_id: projectId, _destroy: false })
    .populate('permissions')
    .lean()
    .exec()
}

/**
 * Tìm role theo ID
 */
const findRoleById = async (roleId) => {
  return await projectRolesModel.findById(roleId).lean()
}

/**
 * Gán role cho member (update member's role trong project.members)
 */
const assignRoleToMember = async (projectId, memberId, roleId, options = {}) => {
  const updatedProject = await projectModel
    .findOneAndUpdate(
      { _id: projectId, 'members.user_id': memberId },
      { $set: { 'members.$.project_role_id': roleId } },
      { new: true, ...options },
    )
    .populate('members.user_id', 'name email')
    .populate('members.project_role_id', 'name')
    .lean()
  if (!updatedProject) return null
  const updatedMember = updatedProject.members.find((m) => m.user_id.toString() === memberId.toString())
  return updatedMember || null
}

/**
 * Kiểm tra member thuộc project
 */
const findMemberById = async (projectId, memberId) => {
  const project = await projectModel
    .findOne(
      { _id: projectId, 'members.user_id': memberId },
      { members: 1 },
    )
    .populate('members.project_role_id', 'name')
    .lean()
  if (!project) return null
  return project.members.find((m) => m.user_id.toString() === memberId.toString()) || null
}

/**
 * Thêm permission vào role
 */
const addPermissionToRole = async (roleId, permissionId, options = {}) => {
  const permission = await permissionModel.findOne({ _id: permissionId }).lean()
  if (!permission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission không tồn tại')
  }
  return await projectRolesModel
    .findOneAndUpdate(
      { _id: roleId, _destroy: false },
      { $addToSet: { permissions: permissionId } },
      { new: true, ...options },
    )
    .populate('permissions')
    .lean()
}

/**
 * Xóa permission khỏi role
 * @returns {Object} Role đã được cập nhật
 * @throws {ApiError} Nếu permission hoặc role không tồn tại
 */
const removePermissionFromRole = async (roleId, permissionId, options = {}) => {
  const permission = await permissionModel.findOne({ _id: permissionId }).lean()
  if (!permission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission không tồn tại')
  }
  return await projectRolesModel
    .findOneAndUpdate(
      { _id: roleId, _destroy: false },
      { $pull: { permissions: permissionId } },
      { new: true, ...options },
    )
    .populate('permissions')
    .lean()
}

/**
 * Lấy danh sách permissions của role
 */
const getPermissionsOfRole = async (roleId) => {
  const role = await projectRolesModel.findOne({ _id: roleId, _destroy: false }).populate('permissions').lean()
  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Role không tồn tại')
  }
  return role.permissions
}

/**
 * Cập nhật thông tin role
 */
const update = async (id, data, options = {}) => {
  const role = await projectRolesModel
    .findOneAndUpdate({ _id: id, _destroy: false }, { $set: data }, { new: true, ...options })
    .populate('permissions')
    .lean()
  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại')
  }
  return role
}

export const projectRoleRepo = {
  findByProjectId,
  findRoleById,
  assignRoleToMember,
  findMemberById,
  addPermissionToRole,
  removePermissionFromRole,
  getPermissionsOfRole,
  update,
}
