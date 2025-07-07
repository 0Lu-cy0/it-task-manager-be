import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res) => {
  try {
    console.log(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'API create new post from validation' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message,
    })
  }
}


export const projectController = {
  createNew,
}
