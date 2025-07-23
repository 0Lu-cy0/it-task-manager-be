import express from 'express'
import { StatusCodes } from 'http-status-codes'
const Router = express.Router()
// import { projectValidation } from '~/validations/projectValidation'
// import { projectController } from '~/controllers/projectController'

Router.route('/')
  .get((req, res) => res.status(StatusCodes.OK).json({
    message: 'API get dashboard',
  }))
// .post(projectValidation.createNew, projectController.createNew)

export const projectRoute = Router
