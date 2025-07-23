//src/service/authService.js
import { authRepository } from '~/repository/authRepository'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { env } from '~/config/environment'

const JWT_SECRET_KEY = env.JWT_SECRET_KEY || 'Cat204'
const JWT_EXPIRES_IN = '1h'

const register = async (data) => {
  const user = await authRepository.register(data)
  const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  })
  return { user: { email: user.email, is_verified: user.is_verified }, token }
}

const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email)
  if (!user || user._destroy) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng')
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng')
  }
  const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  })
  return { user: { email: user.email, is_verified: user.is_verified }, token }
}

const getCurrentUser = async (userId) => {
  const user = await authRepository.findById(userId)
  if (!user || user._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  // Remove sensitive data
  const userData = user.toObject()
  delete userData.password
  return userData
}

const updateProfile = async (userId, updateData) => {
  const user = await authRepository.findById(userId)
  if (!user || user._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  // Update user profile
  Object.assign(user, updateData)
  user.updated_at = Date.now()
  await user.save()

  // Remove sensitive data
  const userData = user.toObject()
  delete userData.password
  return userData
}

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await authRepository.findById(userId)
  if (!user || user._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect')
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  user.updated_at = Date.now()
  await user.save()
}

export const authService = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
}
