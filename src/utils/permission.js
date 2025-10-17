import { permissionModel } from '~/models/permissionModel'
import ApiError from './ApiError'
import { StatusCodes } from 'http-status-codes'

const permissionCache = new Map()

export const getPermissionId = async (permissionName) => {
  if (permissionCache.has(permissionName)) {
    return permissionCache.get(permissionName)
  }

  const permission = await permissionModel.findOne(
    { name: permissionName },
    { _destroy: false },
    { _id: 1 },
  ).lean()

  if (!permission) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Permission '${permissionName}' không tồn tại trong hệ thống`,
    )
  }

  permissionCache.set(permissionName, permission._id.toString())
  return permission._id.toString()
}
