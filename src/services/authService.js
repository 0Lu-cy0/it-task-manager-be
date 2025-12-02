import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import jwt from 'jsonwebtoken'
import { authRepository } from '~/repository/authRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'
import { hashPassword, generateToken, sendResetPasswordEmail } from '~/utils/authUtils'

/**
 * Registers a new user
 */
const register = async data => {
  const { email, password, full_name } = data
  const existingUser = await authRepository.findUserByEmail(email)
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, MESSAGES.EMAIL_ALREADY_EXISTS)
  }

  const hashedPassword = await hashPassword(password)
  const userData = {
    email,
    password: hashedPassword,
    full_name: full_name || null,
  }

  const user = await authRepository.createUser(userData)
  return { _id: user._id, email: user.email, full_name: user.full_name }
}

/**
 * Logs in a user
 */
const login = async data => {
  const { email, password } = data

  try {
    const user = await authRepository.findUserByEmail(email)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS)
    }

    // 🔑 Generate Access Token (sống ngắn, vd: 15m)
    const accessToken = generateToken({ _id: user._id }, process.env.JWT_SECRET_KEY, '1d')

    // 🔑 Generate Refresh Token (sống dài, vd: 7d)
    const refreshToken = generateToken({ _id: user._id }, process.env.JWT_SECRET_KEY_REFRESH, '7d')

    // 👉 Lưu refresh token vào DB/Redis nếu muốn quản lý phiên
    await authRepository.saveRefreshToken(user._id, refreshToken)

    return {
      _id: user._id,
      email: user.email,
      accessToken,
      refreshToken,
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login: Error occurred:', error.message, error.stack)
    throw error
  }
}

//Refresh token
const refreshToken = async refreshToken => {
  // Kiểm tra refresh token trong DB
  const storedToken = await authRepository.findRefreshToken(refreshToken)
  if (!storedToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_REFRESH_TOKEN)
  }

  // Xác thực refresh token
  let decoded
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY_REFRESH)
  } catch (error) {
    await authRepository.deleteRefreshToken(refreshToken) // Xóa token không hợp lệ
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_REFRESH_TOKEN)
  }

  // Tạo access token mới
  const accessToken = generateToken({ _id: decoded._id }, process.env.JWT_SECRET_KEY, '15m')

  // Optional: Tạo refresh token mới (rotation) để tăng bảo mật
  const newRefreshToken = generateToken(
    { _id: decoded._id },
    process.env.JWT_SECRET_KEY_REFRESH,
    '7d'
  )

  // Cập nhật refresh token trong DB
  await authRepository.updateRefreshToken(refreshToken, newRefreshToken)

  return {
    accessToken,
    refreshToken: newRefreshToken,
  }
}

// Logout
const logout = async userId => {
  await authRepository.deleteRefreshTokenByUserId(userId)
}

/**
 * Gets user information
 */
const getUser = async userId => {
  const user = await authRepository.findUserById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  return user
}

/**
 * Updates user profile
 */
const updateProfile = async (userId, data) => {
  const {
    full_name,
    cccd_number,
    birth_date,
    gender,
    nationality,
    expiry_date,
    hometown,
    residence_address,
    avatar_url,
  } = data

  const updateData = {}
  if (full_name !== undefined) updateData.full_name = full_name
  if (cccd_number !== undefined) updateData.cccd_number = cccd_number
  if (birth_date !== undefined) updateData.birth_date = birth_date
  if (gender !== undefined) updateData.gender = gender
  if (nationality !== undefined) updateData.nationality = nationality
  if (expiry_date !== undefined) updateData.expiry_date = expiry_date
  if (hometown !== undefined) updateData.hometown = hometown
  if (residence_address !== undefined) updateData.residence_address = residence_address
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url

  const user = await authRepository.updateUserById(userId, updateData)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }

  // Return user info without sensitive data
  // eslint-disable-next-line no-unused-vars
  const { password, resetToken, resetTokenExpiry, _destroy, __v, ...userInfo } = user
  return userInfo
}

/**
 * Changes user password
 */
const changePassword = async (userId, data) => {
  const { currentPassword, newPassword } = data
  const user = await authRepository.findUserById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS)
  }

  const hashedPassword = await hashPassword(newPassword)
  await authRepository.updateUserById(userId, { password: hashedPassword })
}

/**
 * Requests a password reset
 */
const requestResetPassword = async email => {
  const user = await authRepository.findUserByEmail(email)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }

  const resetToken = randomBytes(32).toString('hex')
  const resetTokenExpiry = Date.now() + 3600000 // 1 hour expiry
  await authRepository.updateUserById(user._id, { resetToken, resetTokenExpiry })
  await sendResetPasswordEmail(email, resetToken)
}

// Confirm reset password
const confirmResetPassword = async ({ resetToken, newPassword }) => {
  const user = await authRepository.findUserByResetToken(resetToken)
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.INVALID_TOKEN)
  }

  const hashedPassword = await hashPassword(newPassword)
  await authRepository.updateUserById(user._id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null,
  })
}

export const authService = {
  register,
  login,
  logout,
  getUser,
  updateProfile,
  changePassword,
  requestResetPassword,
  confirmResetPassword,
  refreshToken,
}
