import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

/**
 * Hashes a password
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Generates a JWT token
 * @param {Object} payload - Data to include in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
}

/**
 * Sends a password reset email
 * @param {string} email - Recipient's email
 * @param {string} resetToken - Reset token
 * @returns {void}
 */
const sendResetPasswordEmail = async (email, resetToken) => {
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

export { hashPassword, generateToken, sendResetPasswordEmail }
