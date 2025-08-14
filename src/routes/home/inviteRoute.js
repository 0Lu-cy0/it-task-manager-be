import express from 'express'
import { inviteController } from '~/controllers/inviteController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
import { inviteMiddleware } from '~/middlewares/inviteMiddleware'
import rateLimit from 'express-rate-limit'

const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // tối đa 5 lần/giờ cho mỗi IP
  message: 'Bạn đã gửi quá nhiều lời mời, vui lòng thử lại sau.',
})

const router = express.Router()

// Tạo link lời mời
router.post(
  '/:projectId/inviteLink',
  authMiddleware.isAuthenticated,
  projectMiddleware.checkProjectPermission('add_member'),
  inviteMiddleware.validateCreate,
  inviteMiddleware.validateParams,
  inviteLimiter,
  inviteController.createInvite,
)

// // Mời thành viên (email hoặc userId)
// router.post(
//   '/:projectId/invites',
//   authMiddleware.isAuthenticated,
//   projectMiddleware.checkProjectPermission('add_member'),
//   inviteController.createMemberInvite, // API này xử lý cả email & userId
// )

// Xử lý nhấp link mời
router.get(
  '/:token',
  authMiddleware.isAuthenticated,
  inviteController.handleInviteLink,
)

// // Chấp nhận hoặc từ chối lời mời
// router.put(
//   '/:projectId/invites/:inviteId',
//   authMiddleware.isAuthenticated,
//   projectMiddleware.checkInviteApprovalPermission,
//   inviteController.handleInviteAction,
// )

// // Lấy danh sách lời mời
// router.get(
//   '/:projectId/invites',
//   authMiddleware.isAuthenticated,
//   projectMiddleware.checkProjectPermission('add_member'),
//   inviteController.listInvites,
// )

export const APIs_invite = router
