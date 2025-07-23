import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { env } from '~/config/environment'

const JWT_SECRET_KEY = env.JWT_SECRET_KEY || 'Cat204'

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy token hoặc token không hợp lệ')
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY)
    req.user = decoded // Lưu thông tin user vào req để sử dụng trong controller
    next()
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ hoặc đã hết hạn')
  }
}

export const authMiddleware = {
  verifyToken,
}
