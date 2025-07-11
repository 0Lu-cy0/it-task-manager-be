/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formater'
import { projectModel } from '~/models/projectModel'
import ApiError from '~/utils/APIError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    const newProject = {
      ...reqBody,
      slug: slugify(reqBody.name),
    }
    const createdProject = await projectModel.createNew(newProject)
    const getNewProject = await projectModel.findOneById(createdProject.insertedId)
    return getNewProject //Trả về cho controller những dữ liệu cần thiết cho phía client bên fe,
    //trong service luôn phải có return
  } catch (error) {
    throw error
  }
}

const getDetails = async (projectId) => {
  try {
    const project = await projectModel.getDetails(projectId)
    if (!project) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not Found Project')
    }
    return project //Trả về cho controller những dữ liệu cần thiết cho phía client bên fe,
    //trong service luôn phải có return
  } catch (error) {
    throw error
  }
}

export const projectService = {
  createNew,
  getDetails,
}
