import express from 'express'
import { APIs_project } from './projectRoute'
import { APIs_task } from './taskRoute'
import { APIs_project_roles } from './projectRolesRoute'
import { APIs_invite } from './inviteRoute'
import { APIs_dashboard } from './dashboardRoute'
import { APIs_notification } from './notificationRoute'
import { APIs_search } from './searchRoute'
import { APIs_column } from './columnRouter'
import { APIs_accessRequest } from './accessRequestRoute'

const Router = express.Router()

Router.use('/columns', APIs_column)
Router.use('/projects', APIs_project)
Router.use('/tasks', APIs_task)
Router.use('/project-roles', APIs_project_roles)
Router.use('/invites', APIs_invite)
Router.use('/access-requests', APIs_accessRequest)
Router.use('/dashboards', APIs_dashboard)
Router.use('/noti', APIs_notification)
Router.use('/', APIs_search)

export const APIs_home = Router
