import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json({ message: 'API create new project' })
  } catch (error) {
    next(error)
  }
}
export const projectController = {
  createNew,
}
