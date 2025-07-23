import express from 'express'
import { authController } from '~/controllers/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

// Auth routes don't need verifyToken middleware for login/register
router.post('/login', authController.login)
router.post('/register', authController.register)

// Protected routes that require authentication
router.use(authMiddleware.verifyToken)
router.get('/me', authController.getCurrentUser)
router.put('/me', authController.updateProfile)
router.put('/me/password', authController.changePassword)

export const APIs_auth = router
