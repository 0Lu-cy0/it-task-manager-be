import { authModel } from '~/models/authModel'
import { refreshTokenModel } from '~/models/refreshTokenModel'

/**
 * Creates a new user in the database
 */
const createUser = async data => {
  return await authModel.create(data)
}

/**
 * Finds a user by email
 */
const findUserByEmail = async email => {
  try {
    const user = await authModel.findOne({ email, _destroy: false }).lean().exec()
    return user
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Error in findUserByEmail:', err)
    throw err // để service/controller bắt tiếp
  }
}

// Save refresh token
const saveRefreshToken = async (userId, refreshToken) => {
  await refreshTokenModel.create({
    user_id: userId,
    token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
  })
}

// Find refresh token
const findRefreshToken = async refreshToken => {
  return await refreshTokenModel.findOne({ token: refreshToken }).lean()
}

// Update refresh token
const updateRefreshToken = async (oldToken, newToken) => {
  await refreshTokenModel.updateOne(
    { token: oldToken },
    {
      token: newToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  )
}

const deleteRefreshToken = async refreshToken => {
  await refreshTokenModel.deleteOne({ token: refreshToken })
}

const deleteRefreshTokenByUserId = async userId => {
  await refreshTokenModel.deleteMany({ user_id: userId })
}

/**
 * Finds a user by ID
 */
const findUserById = async id => {
  return await authModel.findOne({ _id: id, _destroy: false }).lean().exec()
}

const findUsersByIds = async ids => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return []
  }

  return await authModel
    .find({ _id: { $in: ids }, _destroy: false })
    .select('-password -resetToken -resetTokenExpiry')
    .lean()
    .exec()
}

/**
 * Updates a user by ID
 */
const updateUserById = async (id, data) => {
  return await authModel
    .findOneAndUpdate({ _id: id, _destroy: false }, { $set: data }, { new: true })
    .select('-password -resetToken -resetTokenExpiry')
    .lean()
    .exec()
}

/**
 * Finds a user by reset token
 */
const findUserByResetToken = async resetToken => {
  return await authModel
    .findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() }, _destroy: false })
    .exec()
}

export const authRepository = {
  createUser,
  findUserByEmail,
  findUserById,
  findUsersByIds,
  updateUserById,
  findUserByResetToken,
  saveRefreshToken,
  findRefreshToken,
  updateRefreshToken,
  deleteRefreshToken,
  deleteRefreshTokenByUserId,
}
