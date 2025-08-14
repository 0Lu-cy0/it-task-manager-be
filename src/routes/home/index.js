import express from 'express'
import { APIs_project } from './projectRoute'
import { APIs_task } from './taskRoute'
import { APIs_project_roles } from './projectRolesRoutes'
import { APIs_invite } from './inviteRoute'

const Router = express.Router()

Router.use('/projects', APIs_project)
Router.use('/tasks', APIs_task)
Router.use('/project-roles', APIs_project_roles)
Router.use('/invites', APIs_invite)

export const APIs_home = Router
