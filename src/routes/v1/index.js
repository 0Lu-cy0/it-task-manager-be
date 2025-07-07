import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { projectRoute } from './projectRoute'
const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'Tất cả các API V1 đã sẵn sàng để sử dụng',
  })
})

Router.use('/projects', projectRoute)

export const APIs_V1 = Router
