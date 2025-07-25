import express from 'express'
import { authController } from '~/controllers/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', authMiddleware.verifyToken, authController.getUser)
router.put('/me', authMiddleware.verifyToken, authController.updateProfile)
router.put('/me/password', authMiddleware.verifyToken, authController.changePassword)
router.post('/reset-password/request', authController.requestResetPassword)
router.post('/reset-password/confirm', authController.confirmResetPassword)

export const authRoute = router
