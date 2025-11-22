import { projectRoleService } from '~/services/projectRolesService'
import { StatusCodes } from 'http-status-codes'

export const projectRoleController = {
  addPermission: async (req, res, next) => {
    try {
      const { roleId } = req.params
      const { permissionId } = req.body
      const currentUserId = req.user._id

      const updatedRole = await projectRoleService.addPermissionToRole(roleId, permissionId, currentUserId)
      res.status(StatusCodes.OK).json({
        message: 'Permission đã được thêm vào role',
        data: updatedRole,
      })
    } catch (error) {
      next(error)
    }
  },

  removePermission: async (req, res, next) => {
    try {
      const { roleId, permissionId } = req.params
      const currentUserId = req.user._id
      const updatedRole = await projectRoleService.removePermissionFromRole(roleId, permissionId, currentUserId)
      res.status(StatusCodes.OK).json({
        message: 'Permission đã được xóa khỏi role',
        data: updatedRole,
      })
    } catch (error) {
      next(error)
    }
  },

  getPermissions: async (req, res, next) => {
    try {
      const { roleId } = req.params
      const permissions = await projectRoleService.getPermissionsOfRole(roleId)
      res.status(StatusCodes.OK).json({
        message: 'Danh sách permission của role',
        data: permissions,
      })
    } catch (error) {
      next(error)
    }
  },

  getAll: async (req, res, next) => {
    try {
      const { projectId } = req.params
      const roles = await projectRoleService.getProjectRoles(projectId)
      res.status(StatusCodes.OK).json({ message: 'Lấy vai trò dự án thành công', data: roles })
    } catch (error) {
      next(error)
    }
  },

  update: async (req, res, next) => {
    try {
      const role = await projectRoleService.updateProjectRole(req.params.id, req.body)
      res.status(StatusCodes.OK).json({ message: 'Cập nhật vai trò dự án thành công', data: role })
    } catch (error) {
      next(error)
    }
  },

  assignRole: async (req, res, next) => {
    try {
      const { projectId, memberId } = req.params
      const { roleId } = req.body
      const currentUserId = req.user._id

      const updatedMember = await projectRoleService.assignRoleToMember({
        projectId,
        memberId,
        roleId,
        currentUserId,
      })

      res.status(StatusCodes.OK).json({
        message: 'Gán role thành công',
        data: updatedMember,
      })
    } catch (error) {
      next(error)
    }
  },
}
