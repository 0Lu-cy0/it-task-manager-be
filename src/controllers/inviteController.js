import { inviteService } from '~/services/inviteService'
import { StatusCodes } from 'http-status-codes'

export const inviteController = {
  async createInvite(req, res, next) {
    try {
      const { projectId } = req.params
      const { email, roleName = 'viewer' } = req.body
      const userId = req.user._id

      const invite = await inviteService.createInvite(projectId, userId, email, roleName)

      res.status(StatusCodes.CREATED).json({
        message: 'Lời mời đã được gửi',
        invite,
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
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Chưa đăng nhập, vui lòng đăng nhập' })
      }

      const result = await inviteService.handleInviteLink(token, userId)

      res.status(StatusCodes.OK).json({
        message: 'Đã tham gia dự án với vai trò viewer',
        project_id: result.project_id,
      })
    } catch (err) {
      next(err)
    }
  },

  // async handleInviteAction(req, res, next) {
  //   try {
  //     const { projectId, inviteId } = req.params
  //     const { action, roleName = 'member' } = req.body
  //     const userId = req.user._id

  //     const result = await inviteService.handleInviteAction(projectId, inviteId, userId, action, roleName)

  //     res.status(StatusCodes.OK).json(result)
  //   } catch (err) {
  //     next(err)
  //   }
  // },

  // async listInvites(req, res, next) {
  //   try {
  //     const { projectId } = req.params
  //     const userId = req.user._id

  //     const invites = await inviteService.listInvites(projectId, userId)

  //     res.status(StatusCodes.OK).json({
  //       message: 'Danh sách lời mời',
  //       invites,
  //     })
  //   } catch (err) {
  //     next(err)
  //   }
  // },
}
