import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

/**
 * Hashes a password
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
const hashPassword = async password => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Generates a JWT token
 * @param {Object} payload - Data to include in token
 * @param {string} secret - Secret key to sign token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, secret, expiresIn) => {
  const token = jwt.sign(payload, secret, { expiresIn })
  return token
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

/**
 * Sends a project invitation email
 * @param {string} email - Recipient's email
 * @param {string} inviteId - Invite ID for accept/reject
 * @param {string} projectName - Name of the project
 * @param {string} inviterName - Name of the person who sent the invite
 * @returns {void}
 */
const sendInviteEmail = async (email, inviteId, projectName, inviterName) => {
  const acceptLink = `${process.env.CLIENT_URL}/invites/${inviteId}/accept`
  const rejectLink = `${process.env.CLIENT_URL}/invites/${inviteId}/reject`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">🎉 Lời mời tham gia dự án</h2>
      
      <p style="color: #555; font-size: 16px;">Xin chào,</p>
      
      <p style="color: #555; font-size: 16px;">
        <strong>${inviterName}</strong> đã mời bạn tham gia dự án 
        <strong style="color: #1976d2;">${projectName}</strong>.
      </p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${acceptLink}" 
           style="display: inline-block; padding: 12px 30px; margin: 0 10px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          ✓ Chấp nhận
        </a>
        
        <a href="${rejectLink}" 
           style="display: inline-block; padding: 12px 30px; margin: 0 10px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          ✗ Từ chối
        </a>
      </div>
      
      <p style="color: #888; font-size: 14px; text-align: center; margin-top: 40px;">
        Lời mời này sẽ hết hạn sau 7 ngày.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        Nếu bạn không yêu cầu lời mời này, vui lòng bỏ qua email.
      </p>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Lời mời tham gia dự án: ${projectName}`,
    html: htmlContent,
  })
}

export { hashPassword, generateToken, sendResetPasswordEmail, sendInviteEmail }
