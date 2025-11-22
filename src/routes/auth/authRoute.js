import express from 'express'
import { authController } from '~/controllers/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import rateLimit from 'express-rate-limit'
import { authValidation } from '~/validations/authValidation'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per 15 minutes per IP
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
})

const router = express.Router()

// ============== AUTHENTICATION ==============

// Đăng ký tài khoản mới
// POST /auth/register
router.post('/register', authLimiter, authController.register)

// Đăng nhập
// POST /auth/login
router.post('/login', authLimiter, authController.login)

// Đăng xuất
// POST /auth/logout (RESTful: POST thay vì GET)
router.post('/logout', authMiddleware.verifyToken, authController.logout)

// Refresh access token
// POST /auth/token/refresh (RESTful: resource là token)
router.post(
  '/token/refresh',
  authLimiter,
  authValidation.validateRefreshToken,
  authController.refreshToken
)

// ============== PASSWORD MANAGEMENT ==============

// Yêu cầu reset password (gửi email)
// POST /auth/password/reset-requests
router.post('/password/reset-requests', authLimiter, authController.requestResetPassword)

// Xác nhận reset password (với token)
// POST /auth/password/reset-confirmations
router.post('/password/reset-confirmations', authLimiter, authController.confirmResetPassword)

// Đổi password (khi đã đăng nhập)
// PUT /auth/me/password
router.put('/me/password', authMiddleware.isAuthenticated, authController.changePassword)

// ============== USER PROFILE ==============

// Lấy thông tin user hiện tại
// GET /auth/me
router.get('/me', authMiddleware.isAuthenticated, authController.getUser)

// Cập nhật thông tin profile
// PUT /auth/me
router.put('/me', authMiddleware.isAuthenticated, authController.updateProfile)

export const authRoute = router
