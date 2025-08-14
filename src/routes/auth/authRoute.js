import express from 'express'
import { authController } from '~/controllers/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // tối đa 10 lần/15 phút cho mỗi IP
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
})

const router = express.Router()

router.post('/register', authLimiter, authController.register)
router.post('/login', authLimiter, authController.login)
router.post('/reset-password/request', authLimiter, authController.requestResetPassword)
router.post('/reset-password/confirm', authLimiter, authController.confirmResetPassword)
router.get('/me', authMiddleware.verifyToken, authController.getUser)
router.put('/me', authMiddleware.verifyToken, authController.updateProfile)
router.put('/me/password', authMiddleware.verifyToken, authController.changePassword)

export const authRoute = router
