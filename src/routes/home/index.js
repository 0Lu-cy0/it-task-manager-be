import express from 'express'
import { APIs_project } from './projectRoute'
import { APIs_task } from './taskRoute'

const Router = express.Router()

Router.use('/projects', APIs_project)
Router.use('/tasks', APIs_task)


export const APIs_home = Router
