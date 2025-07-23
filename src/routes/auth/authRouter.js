//src/route/auth/authRoute.js
import express from 'express'
const Router = express.Router()
import { authController } from '~/controllers/authController'

Router.post('/login', authController.login)
Router.post('/register', authController.register)

export const authRoute = Router
