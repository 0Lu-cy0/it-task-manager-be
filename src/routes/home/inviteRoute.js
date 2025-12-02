import express from 'express'
import { inviteController } from '~/controllers/inviteController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
import { inviteValidate } from '~/validations/inviteValidation'
import { validate } from '~/middlewares/validationMiddleware'

const router = express.Router()
router.use(authMiddleware.isAuthenticated)

// ============== PROJECT INVITES ==============

// Lấy danh sách lời mời của user đang đăng nhập
// GET /invites/me (thay vì /invites/my-invites)
router.get('/me', inviteController.getUserInvites)

// Lấy permanent invite link của project
// GET /invites/projects/:projectId/permanent-link
router.get(
  '/projects/:projectId/permanent-link',
  projectMiddleware.checkProjectPermission('add_member'),
  inviteController.getPermanentInvite
)

// Lấy danh sách lời mời qua email của project
// GET /invites/projects/:projectId/emails
router.get(
  '/projects/:projectId/emails',
  projectMiddleware.checkProjectPermission('add_member'),
  inviteController.getEmailInvites
)

// Tạo và gửi lời mời qua email (RESTful: POST to create invite)
// POST /invites/projects/:projectId
router.post(
  '/projects/:projectId',
  projectMiddleware.checkProjectPermission('add_member'),
  validate(inviteValidate.validateSendInviteEmail),
  inviteController.sendInviteByEmail
)

// ============== INVITE ACTIONS ==============

// Chấp nhận lời mời (RESTful: PATCH để update status)
// PATCH /invites/:inviteId (body: { action: "accept" })
router.patch('/:inviteId/accept', inviteController.acceptInvite)

// Từ chối lời mời (RESTful: PATCH để update status)
// PATCH /invites/:inviteId (body: { action: "reject" })
router.patch('/:inviteId/reject', inviteController.rejectInvite)

// Hủy lời mời (dành cho người mời)
// DELETE /invites/:inviteId
router.delete('/:inviteId', inviteController.cancelInvite)

// ============== PERMANENT INVITE LINK ==============

// Xử lý nhấp link mời (permanent invite)
// GET /invites/token/:token (rõ ràng hơn là /:token)
router.get('/token/:token', inviteController.handleInviteLink)

export const APIs_invite = router
