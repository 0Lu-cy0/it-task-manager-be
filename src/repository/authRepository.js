import { authModel } from '~/models/authModel'

/**
 * Creates a new user in the database
 * @param {Object} data - User data (e.g., email, password, full_name)
 * @returns {Object} Created user
 */
const createUser = async (data) => {
  return await authModel.create(data)
}

/**
 * Finds a user by email
 * @param {string} email - User's email
 * @returns {Object|null} User if found, null otherwise
 */
const findUserByEmail = async (email) => {
  return await authModel.findOne({ email, _destroy: false }).lean().exec()
}

/**
 * Finds a user by ID
 * @param {string} id - User's ID
 * @returns {Object|null} User if found, null otherwise
 */
const findUserById = async (id) => {
  return await authModel.findOne({ _id: id, _destroy: false }).lean().exec()
}

/**
 * Updates a user by ID
 * @param {string} id - User's ID
 * @param {Object} data - Data to update
 * @returns {Object|null} Updated user
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
 * @param {string} resetToken - Reset token
 * @returns {Object|null} User if found, null otherwise
 */
const findUserByResetToken = async (resetToken) => {
  return await authModel
    .findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() }, _destroy: false })
    .exec()
}

export const authRepository = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserById,
  findUserByResetToken,
}
