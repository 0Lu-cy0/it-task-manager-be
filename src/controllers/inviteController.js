import { inviteService } from '~/services/inviteService'
import { StatusCodes } from 'http-status-codes'

export const inviteController = {
  async getPermanentInvite(req, res, next) {
    try {
      const { projectId } = req.params
      const invite = await inviteService.getPermanentInvite(projectId)

      res.status(StatusCodes.OK).json({
        message: 'Link lời mời vĩnh viễn',
        invite,
      })
    } catch (err) {
      next(err)
    }
  },

  async getEmailInvites(req, res, next) {
    try {
      const { projectId } = req.params

      const invites = await inviteService.getEmailInvites(projectId)

      res.status(StatusCodes.OK).json({
        message: 'Danh sách lời mời qua email',
        invites,
      })
    } catch (err) {
      next(err)
    }
  },

  async handleInviteLink(req, res, next) {
    try {
      const { token } = req.params
      const userId = req.user?._id

      if (!userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'Chưa đăng nhập, vui lòng đăng nhập' })
      }

      const result = await inviteService.handleInviteLink(token, userId)

      res.status(StatusCodes.OK).json({
        message: 'Đã tham gia dự án với vai trò member',
        project_id: result.project_id,
      })
    } catch (err) {
      next(err)
    }
  },

  // Gửi lời mời qua email
  async sendInviteByEmail(req, res, next) {
    try {
      const { projectId } = req.params
      const { email, roleId } = req.body
      const userId = req.user._id

      const result = await inviteService.sendInviteByEmail(projectId, email, userId, roleId)

      res.status(StatusCodes.CREATED).json(result)
    } catch (err) {
      next(err)
    }
  },

  // Chấp nhận lời mời
  async acceptInvite(req, res, next) {
    try {
      const { inviteId } = req.params
      const userId = req.user._id

      const result = await inviteService.acceptInvite(inviteId, userId)

      res.status(StatusCodes.OK).json(result)
    } catch (err) {
      next(err)
    }
  },

  // Từ chối lời mời
  async rejectInvite(req, res, next) {
    try {
      const { inviteId } = req.params
      const userId = req.user._id

      const result = await inviteService.rejectInvite(inviteId, userId)

      res.status(StatusCodes.OK).json(result)
    } catch (err) {
      next(err)
    }
  },

  // Lấy danh sách lời mời của user
  async getUserInvites(req, res, next) {
    try {
      const userId = req.user._id

      const invites = await inviteService.getUserInvites(userId)

      res.status(StatusCodes.OK).json({
        message: 'Danh sách lời mời',
        invites,
      })
    } catch (err) {
      next(err)
    }
  },

  // Hủy lời mời
  async cancelInvite(req, res, next) {
    try {
      const { inviteId } = req.params
      const userId = req.user._id

      const result = await inviteService.cancelInvite(inviteId, userId)

      res.status(StatusCodes.OK).json(result)
    } catch (err) {
      next(err)
    }
  },
}
