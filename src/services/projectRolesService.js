import { projectRoleRepo } from '~/repository/projectRolesRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { projectService } from '~/services/projectService'
import { MESSAGES } from '~/constants/messages'
import mongoose from 'mongoose'
import winston from 'winston'

const logger = winston.createLogger({
  // Giả định cấu hình logger đã được thiết lập
  transports: [new winston.transports.Console()],
})

const checkUserPermission = async (projectId, userId, role, targetRoleName) => {
  const isOwner = await projectService.verifyProjectPermission(projectId, userId, 'owner_permission')
  if (isOwner) {
    return true // Owner bypass tất cả
  }

  if (role.name === 'lead') {
    if (['owner', 'lead'].includes(targetRoleName)) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN_MODIFY_OWNER_OR_LEAD)
    }
    return true // Lead có thể chỉnh sửa member/viewer
  }

  throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN_ASSIGN_ROLE)
}

const addPermissionToRole = async (roleId, permissionId, currentUserId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Định dạng roleId không hợp lệ')
    }
    // Kiểm tra role tồn tại
    const role = await projectRoleRepo.findRoleById(roleId)
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND)
    }

    // Kiểm tra quyền
    if (role.name === 'owner') {
      const isOwner = await projectService.verifyProjectPermission(role.project_id, currentUserId, 'owner_permission')
      if (!isOwner) {
        throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN_MODIFY_OWNER)
      }
    }

    // Thêm permission
    const updatedRole = await projectRoleRepo.addPermissionToRole(roleId, permissionId)
    if (!updatedRole) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND)
    }

    logger.info(`Permission ${permissionId} added to role ${roleId} by user ${currentUserId}`)
    return updatedRole
  } catch (error) {
    logger.error(`Error in addPermissionToRole: ${error.message}`)
    throw error
  }
}

const removePermissionFromRole = async (roleId, permissionId, currentUserId) => {
  try {
    // Kiểm tra role tồn tại
    const role = await projectRoleRepo.findRoleById(roleId)
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND)
    }
    // Kiểm tra quyền
    if (role.name === 'owner') {
      const isOwner = await projectService.verifyProjectPermission(role.project_id, currentUserId, 'owner_permission')
      if (!isOwner) {
        throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN_MODIFY_OWNER)
      }
    }
    // Xóa permission
    const updatedRole = await projectRoleRepo.removePermissionFromRole(roleId, permissionId)
    if (!updatedRole) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND)
    }

    logger.info(`Permission ${permissionId} đã bị xóa từ role: ${roleId} bởi người dùng: ${currentUserId}`)
    return updatedRole
  } catch (error) {
    logger.error(`Lỗi trong removePermissionFromRole: ${error.message}`)
    throw error
  }
}

const getPermissionsOfRole = async (roleId) => {
  try {
    // Lấy permissions
    const permissions = await projectRoleRepo.getPermissionsOfRole(roleId)
    if (!permissions.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NO_PERMISSIONS)
    }

    return permissions
  } catch (error) {
    logger.error(`Error in getPermissionsOfRole: ${error.message}`)
    throw error
  }
}

const getProjectRoles = async (projectId) => {
  try {
    // Lấy danh sách roles
    const roles = await projectRoleRepo.findByProjectId(projectId)
    return roles
  } catch (error) {
    logger.error(`Error in getProjectRoles: ${error.message}`)
    throw error
  }
}

const updateProjectRole = async (id, data, currentUserId) => {
  try {
    // Kiểm tra role tồn tại
    const role = await projectRoleRepo.findRoleById(id)
    if (!role) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND)
    }

    // Kiểm tra quyền
    if (role.name === 'owner') {
      const isOwner = await projectService.verifyProjectPermission(role.project_id, currentUserId, 'owner_permission')
      if (!isOwner) {
        throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN_MODIFY_OWNER)
      }
    }

    // Cập nhật role
    const updatedRole = await projectRoleRepo.update(id, data)
    logger.info(`Role ${id} updated by user ${currentUserId}`)
    return updatedRole
  } catch (error) {
    logger.error(`Error in updateProjectRole: ${error.message}`)
    throw error
  }
}

const assignRoleToMember = async (projectId, memberId, roleId, currentUserId) => {
  try {
    // Kiểm tra current member
    const currentMember = await projectRoleRepo.findMemberByUserAndProject(currentUserId, projectId)
    if (!currentMember) {
      throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.NOT_PROJECT_MEMBER)
    }

    // Kiểm tra target member
    const targetMember = await projectRoleRepo.findMemberById(memberId)
    if (!targetMember || targetMember.project_id.toString() !== projectId) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.MEMBER_NOT_FOUND)
    }

    // Kiểm tra role mới
    const targetRole = await projectRoleRepo.findRoleById(roleId)
    if (!targetRole || targetRole.project_id.toString() !== projectId) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.ROLE_NOT_FOUND_IN_PROJECT)
    }

    // Kiểm tra quyền
    const currentRole = await projectRoleRepo.findRoleById(currentMember.role_id)
    const targetMemberRole = await projectRoleRepo.findRoleById(targetMember.role_id)
    await checkUserPermission(projectId, currentUserId, currentRole, targetMemberRole.name)

    // Gán role
    const updatedMember = await projectRoleRepo.assignRoleToMember(memberId, roleId)
    if (!updatedMember) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.MEMBER_UPDATE_FAILED)
    }

    logger.info(`Role ${roleId} assigned to member ${memberId} in project ${projectId} by user ${currentUserId}`)
    return updatedMember
  } catch (error) {
    logger.error(`Error in assignRoleToMember: ${error.message}`)
    throw error
  }
}

export const projectRoleService = {
  addPermissionToRole,
  removePermissionFromRole,
  getPermissionsOfRole,
  getProjectRoles,
  updateProjectRole,
  assignRoleToMember,
}
