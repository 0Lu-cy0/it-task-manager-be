import express from 'express'
import { StatusCodes } from 'http-status-codes'
const Router = express.Router()
import { projectValidation } from '~/validations/projectValidation'

Router.route('/')
  .get((req, res) => res.status(StatusCodes.OK).json({
    message: 'API get list projects',
  }))
  .post(projectValidation.createNew)

export const projectRoute = Router
