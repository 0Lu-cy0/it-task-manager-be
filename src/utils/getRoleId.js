// utils/getRoleId.js
import { projectRolesModel } from '~/models/projectRolesModel'
import ApiError from './ApiError'
import { StatusCodes } from 'http-status-codes'

const roleCache = new Map()

export const getRoleId = async (projectId, roleName) => {
  const cacheKey = `${projectId}_${roleName}`
  if (roleCache.has(cacheKey)) {
    return roleCache.get(cacheKey)
  }

  const role = await projectRolesModel.findOne(
    { project_id: projectId, name: roleName },
    { _id: 1 },
  ).lean()

  if (!role) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Role '${roleName}' không tồn tại trong project ${projectId}`,
    )
  }

  roleCache.set(cacheKey, role._id.toString())
  return role._id.toString()
}
