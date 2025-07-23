//src/route/auth/index.js
import express from 'express'
import { authRoute } from './authRouter'
const Router = express.Router()

Router.use('/auth', authRoute)

export const APIs_auth = Router
