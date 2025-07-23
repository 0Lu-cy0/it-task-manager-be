//src/repository/projectRepository.js
import { projectModel } from '~/models/projectModel'
import { projectValidation } from '~/validations/projectValidation'
import { ApiError } from '~/utils/APIError'
import { StatusCodes } from 'http-status-codes'

// Tạo mới project
const createNew = async (data) => {
  const validData = await projectValidation.validateBeforeCreate(data)
  return await projectModel.create(validData)
}

// Lấy 1 project theo ID
const findOneById = async (id) => {
  return await projectModel.findById(id).exec()
}

// Lấy tất cả project chưa bị xoá
const getAll = async (filter = { _destroy: false }, sort = { created_at: -1 }, options = {}) => {
  if (!filter || typeof filter !== 'object') {
    throw new Error('Invalid filter')
  }
  return await projectModel.find(filter).sort(sort).setOptions(options)
}

const update = async (projectId, updateData) => {
  try {
    const updatedProject = await projectModel.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true },
    )
    return updatedProject
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error updating project')
  }
}

const softDelete = async (projectId) => {
  try {
    await projectModel.findByIdAndUpdate(projectId, { _destroy: true })
    return true
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error deleting project')
  }
}

const addMember = async (projectId, memberData) => {
  try {
    const project = await projectModel.findByIdAndUpdate(
      projectId,
      { $push: { members: memberData } },
      { new: true },
    )
    return project
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error adding project member')
  }
}

const removeMember = async (projectId, userId) => {
  try {
    await projectModel.findByIdAndUpdate(
      projectId,
      { $pull: { members: { user_id: userId } } },
    )
    return true
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error removing project member')
  }
}

const updateMemberRole = async (projectId, userId, roleId) => {
  try {
    const project = await projectModel.findOneAndUpdate(
      { _id: projectId, 'members.user_id': userId },
      { $set: { 'members.$.role_id': roleId } },
      { new: true },
    )
    return project
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error updating member role')
  }
}

export const projectRepository = {
  createNew,
  findOneById,
  getAll,
  update,
  softDelete,
  addMember,
  removeMember,
  updateMemberRole,
}
