import { StatusCodes } from 'http-status-codes'
import { authService } from '~/services/authService'
import { authValidation } from '~/validations/authValidation'

/**
 * Đăng ký người dùng mới
 */
const register = async (req, res, next) => {
  try {
    const data = await authValidation.validateBeforeRegister(req.body)
    const user = await authService.register(data)
    res.status(StatusCodes.CREATED).json({ message: 'Đăng ký thành công', data: user })
  } catch (error) {
    next(error)
  }
}

/**
 * Đăng nhập người dùng
 */
const login = async (req, res, next) => {
  try {
    const data = await authValidation.validateBeforeLogin(req.body)
    const result = await authService.login(data)
    res.status(StatusCodes.OK).json({ message: 'Đăng nhập thành công', data: result })
  } catch (error) {
    next(error)
  }
}

/**
 * Lấy thông tin người dùng
 */
const getUser = async (req, res, next) => {
  try {
    const user = await authService.getUser(req.user._id)
    res.status(StatusCodes.OK).json({ message: 'Lấy thông tin người dùng thành công', data: user })
  } catch (error) {
    next(error)
  }
}

/**
 * Cập nhật hồ sơ người dùng
 */
const updateProfile = async (req, res, next) => {
  try {
    const data = await authValidation.validateProfileUpdate(req.body)
    const user = await authService.updateProfile(req.user._id, data)
    res.status(StatusCodes.OK).json({ message: 'Cập nhật hồ sơ thành công', data: user })
  } catch (error) {
    next(error)
  }
}

/**
 * Đổi mật khẩu
 */
const changePassword = async (req, res, next) => {
  try {
    const data = await authValidation.validatePasswordChange(req.body)
    await authService.changePassword(req.user._id, data)
    res.status(StatusCodes.OK).json({ message: 'Đổi mật khẩu thành công' })
  } catch (error) {
    next(error)
  }
}

/**
 * Yêu cầu đặt lại mật khẩu
 */
const requestResetPassword = async (req, res, next) => {
  try {
    const data = await authValidation.validateResetPasswordRequest(req.body)
    const result = await authService.requestResetPassword(data.email)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * Xác nhận đặt lại mật khẩu
 */
const confirmResetPassword = async (req, res, next) => {
  try {
    const data = await authValidation.validateResetPasswordConfirm(req.body)
    await authService.confirmResetPassword(data)
    res.status(StatusCodes.OK).json({ message: 'Đặt lại mật khẩu thành công' })
  } catch (error) {
    next(error)
  }
}

export const authController = {
  register,
  login,
  getUser,
  updateProfile,
  changePassword,
  requestResetPassword,
  confirmResetPassword,
}
