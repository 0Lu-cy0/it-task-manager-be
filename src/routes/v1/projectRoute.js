import express from 'express'
import { StatusCodes } from 'http-status-codes'
const Router = express.Router()
import { projectValidation } from '~/validations/projectValidation'
import { projectController } from '~/controllers/projectController'

Router.route('/')
  .get((req, res) => res.status(StatusCodes.OK).json({
    message: 'API get list projects',
  }))
  .post(projectValidation.createNew, projectController.createNew)

Router.route('/:id')
  .get(projectController.getDetails)
// .put(projectValidation.update, projectController.update)
// .delete(projectController.delete)

export const projectRoute = Router
