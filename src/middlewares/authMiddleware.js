import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { env } from '~/config/environment'
import { MESSAGES } from '~/constants/messages'

/**
 * Xác thực JWT token từ header Authorization
 * @param {Object} req - Request chứa header Authorization
 * @param {Object} res - Response trả về
 * @param {Function} next - Middleware tiếp theo
 * @throws {ApiError} Nếu token không hợp lệ hoặc thiếu
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED)
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET_KEY)
    req.user = decoded // Lưu thông tin user vào req để sử dụng trong controller
    next()
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_TOKEN)
  }
}

/**
 * Kiểm tra xem người dùng đã xác thực chưa
 * @param {Object} req - Request chứa thông tin người dùng
 * @param {Object} res - Response trả về
 * @param {Function} next - Middleware tiếp theo
 * @throws {ApiError} Nếu không có thông tin người dùng
 */
const ensureAuthenticated = (req, res, next) => {
  if (!req.user?._id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED)
  }
  next()
}

//Gộp 2 cái vào 1 cho tiện các route yêu cầu đăng nhập mới có thể sử dụng
const isAuthenticated = [verifyToken, ensureAuthenticated]

export const authMiddleware = {
  verifyToken,
  ensureAuthenticated,
  isAuthenticated,
}
