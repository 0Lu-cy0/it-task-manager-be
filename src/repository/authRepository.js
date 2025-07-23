//src/repository/authRepository.js
import { authModel } from '~/models/authModel'
import { authValidation } from '~/validations/authValidation'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const register = async (data) => {
  const validData = await authValidation.validateBeforeRegister(data)
  const existingUser = await authModel.findOne({ email: validData.email })
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email đã tồn tại')
  }
  return await authModel.create(validData)
}

const findByEmail = async (email) => {
  return await authModel.findOne({ email, _destroy: false }).exec()
}

export const authRepository = {
  register,
  findByEmail,
}
