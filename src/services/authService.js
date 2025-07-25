import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'
import { authModel } from '~/models/authModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

/**
 * Đăng ký người dùng mới
 * @param {Object} data - Dữ liệu đăng ký (email, password)
 * @returns {Object} Người dùng đã được tạo
 * @throws {ApiError} Nếu email đã tồn tại
 */
const register = async (data) => {
  const { email, password } = data
  const existingUser = await authModel.findOne({ email, _destroy: false })
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, MESSAGES.EMAIL_ALREADY_EXISTS)
  }
  const user = await authModel.create({ email, password })
  return { _id: user._id, email: user.email }
}

/**
 * Đăng nhập người dùng
 * @param {Object} data - Dữ liệu đăng nhập (email, password)
 * @returns {Object} Thông tin người dùng và token
 * @throws {ApiError} Nếu thông tin đăng nhập không hợp lệ
 */
const login = async (data) => {
  const { email, password } = data
  const user = await authModel.findOne({ email, _destroy: false })
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS)
  }
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
  return { _id: user._id, email: user.email, token }
}

/**
 * Lấy thông tin người dùng
 * @param {string} userId - ID của người dùng
 * @returns {Object} Thông tin người dùng
 * @throws {ApiError} Nếu người dùng không tồn tại
 */
const getUser = async (userId) => {
  const user = await authModel.findOne({ _id: userId, _destroy: false }).select('-password -resetToken -resetTokenExpiry')
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  return user
}

/**
 * Cập nhật hồ sơ người dùng
 * @param {string} userId - ID của người dùng
 * @param {Object} data - Dữ liệu cập nhật (full_name, avatar_url, phone, department, language)
 * @returns {Object} Thông tin người dùng đã cập nhật
 * @throws {ApiError} Nếu người dùng không tồn tại
 */
const updateProfile = async (userId, data) => {
  const user = await authModel.findOneAndUpdate(
    { _id: userId, _destroy: false },
    { $set: data },
    { new: true },
  ).select('-password -resetToken -resetTokenExpiry')
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  return user
}

/**
 * Đổi mật khẩu
 * @param {string} userId - ID của người dùng
 * @param {Object} data - Dữ liệu mật khẩu (currentPassword, newPassword)
 * @returns {void}
 * @throws {ApiError} Nếu mật khẩu hiện tại không đúng
 */
const changePassword = async (userId, data) => {
  const { currentPassword, newPassword } = data
  const user = await authModel.findOne({ _id: userId, _destroy: false })
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS)
  }
  user.password = newPassword
  await user.save()
}

/**
 * Yêu cầu đặt lại mật khẩu
 * @param {string} email - Email của người dùng
 * @returns {void}
 * @throws {ApiError} Nếu email không tồn tại
 */
const requestResetPassword = async (email) => {
  const user = await authModel.findOne({ email, _destroy: false })
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  const resetToken = randomBytes(32).toString('hex')
  const resetTokenExpiry = Date.now() + 3600000 // Hết hạn sau 1 giờ
  user.resetToken = resetToken
  user.resetTokenExpiry = resetTokenExpiry
  await user.save()

  // Gửi email chứa link đặt lại mật khẩu
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Đặt lại mật khẩu',
    html: `Nhấp vào link để đặt lại mật khẩu: <a href="${resetLink}">${resetLink}</a><br>Link này có hiệu lực trong 1 giờ.`,
  })
}

/**
 * Xác nhận đặt lại mật khẩu
 * @param {Object} data - Dữ liệu chứa resetToken, newPassword
 * @returns {void}
 * @throws {ApiError} Nếu token không hợp lệ hoặc hết hạn
 */
const confirmResetPassword = async ({ resetToken, newPassword }) => {
  const user = await authModel.findOne({
    resetToken,
    resetTokenExpiry: { $gt: Date.now() },
    _destroy: false,
  })
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.INVALID_TOKEN)
  }
  user.password = newPassword
  user.resetToken = null
  user.resetTokenExpiry = null
  await user.save()
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
