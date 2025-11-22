import { accessRequestService } from '~/services/accessRequestService'
import { StatusCodes } from 'http-status-codes'

export const accessRequestController = {
  // User request access vào private project
  async requestAccess(req, res, next) {
    try {
      const { projectId } = req.params
      const { message } = req.body
      const userId = req.user._id

      const result = await accessRequestService.requestAccess(projectId, userId, message)

      res.status(StatusCodes.CREATED).json(result)
    } catch (err) {
      next(err)
    }
  },

  // Admin approve request
  async approveRequest(req, res, next) {
    try {
      const { requestId } = req.params
      const { roleId } = req.body
      const adminId = req.user._id

      const result = await accessRequestService.approveRequest(requestId, adminId, roleId)

      res.status(StatusCodes.OK).json(result)
    } catch (err) {
      next(err)
    }
  },

  // Admin reject request
  async rejectRequest(req, res, next) {
    try {
      const { requestId } = req.params
      const { reason } = req.body
      const adminId = req.user._id

      const result = await accessRequestService.rejectRequest(requestId, adminId, reason)

      res.status(StatusCodes.OK).json(result)
    } catch (err) {
      next(err)
    }
  },

  // Lấy danh sách requests của project (cho admin)
  async getProjectRequests(req, res, next) {
    try {
      const { projectId } = req.params
      const { status } = req.query
      const adminId = req.user._id

      const requests = await accessRequestService.getProjectRequests(projectId, adminId, status)

      res.status(StatusCodes.OK).json({
        message: 'Danh sách yêu cầu truy cập',
        requests,
      })
    } catch (err) {
      next(err)
    }
  },

  // Lấy danh sách requests của user
  async getUserRequests(req, res, next) {
    try {
      const userId = req.user._id

      const requests = await accessRequestService.getUserRequests(userId)

      res.status(StatusCodes.OK).json({
        message: 'Danh sách yêu cầu truy cập của bạn',
        requests,
      })
    } catch (err) {
      next(err)
    }
  },
}
