import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { MESSAGES } from '~/constants/messages'

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED)
  }

  const token = authHeader.split(' ')[1]
  // Sau đó jwt.verify...
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.user = decoded // Lưu thông tin user vào req để sử dụng trong controller
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.EXPRIRED_ACCESS_TOKEN)
    }
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_TOKEN)
  }
}

const ensureAuthenticated = (req, res, next) => {
  if (!req.user?._id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.UNAUTHORIZED)
  }
  next()
}

// Gộp 2 cái vào 1 cho tiện các route yêu cầu đăng nhập mới có thể sử dụng
const isAuthenticated = [verifyToken, ensureAuthenticated]

export const authMiddleware = {
  verifyToken,
  ensureAuthenticated,
  isAuthenticated,
}
