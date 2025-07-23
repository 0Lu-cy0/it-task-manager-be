import { projectRepository } from '~/repository/projectRepository'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (data) => {
  if (!data.created_by) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Created_by is required')
  }
  return await projectRepository.createNew(data)
}

const getAll = async (userId, { page = 1, limit = 10, sortBy = 'created_at', order = 'desc' } = {}) => {
  const filter = {
    $or: [
      { 'members.user_id': userId },
      { created_by: userId },
    ],
    _destroy: false,
  }
  const sort = { [sortBy]: order === 'desc' ? -1 : 1 }
  const options = { skip: (page - 1) * limit, limit: parseInt(limit) }

  const projects = await projectRepository.getAll(filter, sort, options)
  if (projects.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No projects found for this user')
  }
  return projects
}

const updateProject = async (projectId, updateData) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found')
  }

  const updatedProject = await projectRepository.update(projectId, updateData)
  return updatedProject
}

const deleteProject = async (projectId) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found')
  }

  await projectRepository.softDelete(projectId)
  return true
}

const getProjectById = async (projectId) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found')
  }
  return project
}

const addProjectMember = async (projectId, memberData) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found')
  }

  const isMember = project.members.some(member => member.user_id.toString() === memberData.user_id)
  if (isMember) {
    throw new ApiError(StatusCodes.CONFLICT, 'User is already a member of this project')
  }

  const updatedProject = await projectRepository.addMember(projectId, {
    ...memberData,
    joined_at: Date.now(),
  })
  return updatedProject
}

const removeProjectMember = async (projectId, userId) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found')
  }

  const isMember = project.members.some(member => member.user_id.toString() === userId)
  if (!isMember) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User is not a member of this project')
  }

  await projectRepository.removeMember(projectId, userId)
  return true
}

const updateProjectMemberRole = async (projectId, userId, roleId) => {
  const project = await projectRepository.findOneById(projectId)
  if (!project || project._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found')
  }

  const member = project.members.find(member => member.user_id.toString() === userId)
  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User is not a member of this project')
  }

  const updatedProject = await projectRepository.updateMemberRole(projectId, userId, roleId)
  return updatedProject
}

export const projectService = {
  createNew,
  getAll,
  updateProject,
  deleteProject,
  getProjectById,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
}
