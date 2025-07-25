import { authModel } from '~/models/authModel'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

/**
 * Đăng ký người dùng mới trong cơ sở dữ liệu
 * @param {Object} data - Dữ liệu người dùng (email, password)
 * @returns {Object} Người dùng đã được tạo
 * @throws {ApiError} Nếu email đã tồn tại
 */
const register = async (data) => {
  const existingUser = await authModel.findOne({ email: data.email }).lean()
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, MESSAGES.EMAIL_EXISTS)
  }
  return await authModel.create(data)
}

/**
 * Tìm người dùng theo email
 * @param {string} email - Email của người dùng
 * @returns {Object} Thông tin người dùng
 * @throws {ApiError} Nếu người dùng không tồn tại hoặc đã bị xóa mềm
 */
const findByEmail = async (email) => {
  const user = await authModel.findOne({ email, _destroy: false }).lean().exec()
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  return user
}

/**
 * Tìm người dùng theo ID
 * @param {string} id - ID của người dùng
 * @returns {Object} Thông tin người dùng
 * @throws {ApiError} Nếu người dùng không tồn tại hoặc đã bị xóa mềm
 */
const findById = async (id) => {
  const user = await authModel.findById(id).lean().exec()
  if (!user || user._destroy) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.USER_NOT_FOUND)
  }
  return user
}

export const authRepository = {
  register,
  findByEmail,
  findById,
}
