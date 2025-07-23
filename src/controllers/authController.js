import { StatusCodes } from 'http-status-codes'
import { authService } from '~/services/authService'
import { authValidation } from '~/validations/authValidation'

const login = async (req, res, next) => {
  try {
    const validatedData = await authValidation.validateBeforeLogin(req.body)
    const result = await authService.login(validatedData)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const register = async (req, res, next) => {
  try {
    const validatedData = await authValidation.validateBeforeRegister(req.body)
    const result = await authService.register(validatedData)

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Registration successful',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const getCurrentUser = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user._id)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const validatedData = await authValidation.validateProfileUpdate(req.body)
    const result = await authService.updateProfile(req.user._id, validatedData)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const validatedData = await authValidation.validatePasswordChange(req.body)
    await authService.changePassword(req.user._id, validatedData)

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Password changed successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const authController = {
  login,
  register,
  getCurrentUser,
  updateProfile,
  changePassword,
}

