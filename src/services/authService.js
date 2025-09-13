import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { authRepository } from '~/repository/authRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'
import { hashPassword, generateToken, sendResetPasswordEmail } from '~/utils/authUtils'

/**
 * Registers a new user
 * @param {Object} data - Registration data (email, password, full_name)
 * @returns {Object} Created user
 * @throws {ApiError} If email already exists
 */
const register = async (data) => {
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
 * @param {Object} data - Login data (email, password)
 * @returns {Object} User info and JWT token
 * @throws {ApiError} If credentials are invalid
 */
const login = async (data) => {
  const { email, password } = data

  const user = await authRepository.findUserByEmail(email)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS)
  }

  const token = generateToken({ _id: user._id })
  return { _id: user._id, email: user.email, token }
}

/**
 * Gets user information
 * @param {string} userId - User's ID
 * @returns {Object} User info
 * @throws {ApiError} If user not found
 */
const getUser = async (userId) => {
  const user = await authRepository.findUserById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  return user
}

/**
 * Updates user profile
 * @param {string} userId - User's ID
 * @param {Object} data - Data to update (full_name, avatar_url, phone, department, language)
 * @returns {Object} Updated user info
 * @throws {ApiError} If user not found
 */
const updateProfile = async (userId, data) => {
  const user = await authRepository.updateUserById(userId, data)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  return user
}

/**
 * Changes user password
 * @param {string} userId - User's ID
 * @param {Object} data - Password data (currentPassword, newPassword)
 * @returns {void}
 * @throws {ApiError} If current password is incorrect or user not found
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
 * @param {string} email - User's email
 * @returns {void}
 * @throws {ApiError} If user not found
 */
const requestResetPassword = async (email) => {
  const user = await authRepository.findUserByEmail(email)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }

  const resetToken = randomBytes(32).toString('hex')
  const resetTokenExpiry = Date.now() + 3600000 // 1 hour expiry
  await authRepository.updateUserById(user._id, { resetToken, resetTokenExpiry })
  await sendResetPasswordEmail(email, resetToken)
}

/**
 * Confirms password reset
 * @param {Object} data - Reset data (resetToken, newPassword)
 * @returns {void}
 * @throws {ApiError} If token is invalid or expired
 */
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
  getUser,
  updateProfile,
  changePassword,
  requestResetPassword,
  confirmResetPassword,
}
