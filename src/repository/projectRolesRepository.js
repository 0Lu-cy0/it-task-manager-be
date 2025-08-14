import { projectRolesModel } from '~/models/projectRolesModel'
import { permissionModel } from '~/models/permissionModel' // Giả định model permissions tồn tại; thêm nếu chưa có
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { projectModel } from '~/models/projectModel' // Sử dụng projectModel thay vì ProjectMember

export const projectRoleRepo = {
  findByProjectId: async (projectId) => {
    return await projectRolesModel
      .find({ project_id: projectId, _destroy: false })
      .populate('permissions')
      .lean()
      .exec()
  },

  findRoleById: async (roleId) => {
    return await projectRolesModel.findById(roleId)
  },

  // Gán role cho member (update member's role trong project.members)
  assignRoleToMember: async (projectId, memberId, roleId) => {
    // Cập nhật project.members.$.project_role_id
    const updatedProject = await projectModel
      .findOneAndUpdate(
        { _id: projectId, 'members.user_id': memberId },
        { $set: { 'members.$.project_role_id': roleId } },
        { new: true },
      )
      .populate('members.user_id', 'name email')
      .populate('members.project_role_id', 'name')
      .lean()
    // Trả về member vừa cập nhật (nếu cần)
    if (!updatedProject) return null
    const updatedMember = updatedProject.members.find((m) => m.user_id.toString() === memberId.toString())
    return updatedMember || null
  },

  // Kiểm tra member thuộc project
  findMemberById: async (projectId, memberId) => {
    const project = await projectModel
      .findOne(
        { _id: projectId, 'members.user_id': memberId },
        { members: 1 },
      )
      .populate('members.project_role_id', 'name')
    if (!project) return null
    return project.members.find((m) => m.user_id.toString() === memberId.toString()) || null
  },

  addPermissionToRole: async (roleId, permissionId) => {
    const permission = await permissionModel.findOne({ _id: permissionId }).lean()
    if (!permission) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Permission không tồn tại')
    }

    return await projectRolesModel
      .findOneAndUpdate(
        { _id: roleId, _destroy: false },
        { $addToSet: { permissions: permissionId } }, // Ngăn chặn duplicate
        { new: true },
      )
      .populate('permissions')
      .lean()
  },

  removePermissionFromRole: async (roleId, permissionId) => {
    const permission = await permissionModel.findOne({ _id: permissionId }).lean()
    if (!permission) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Permission không tồn tại')
    }

    return await projectRolesModel
      .findOneAndUpdate(
        { _id: roleId, _destroy: false },
        { $pull: { permissions: permissionId } },
        { new: true },
      )
      .populate('permissions')
      .lean()
  },

  getPermissionsOfRole: async (roleId) => {
    const role = await projectRolesModel.findOne({ _id: roleId, _destroy: false }).populate('permissions').lean()
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Role không tồn tại')
    }
    return role.permissions
  },

  update: async (id, data) => {
    const role = await projectRolesModel
      .findOneAndUpdate({ _id: id, _destroy: false }, { $set: data }, { new: true })
      .populate('permissions')
      .lean()
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Vai trò không tồn tại')
    }
    return role
  },
}
