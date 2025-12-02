import express from 'express'
import { accessRequestController } from '~/controllers/accessRequestController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { projectMiddleware } from '~/middlewares/projectMiddleware'

const router = express.Router()
router.use(authMiddleware.isAuthenticated)

// ============== USER ACCESS REQUESTS ==============

// Lấy danh sách access requests của user hiện tại
// GET /access-requests/me (RESTful: thay vì /my-requests)
router.get('/me', accessRequestController.getUserRequests)

// ============== PROJECT ACCESS REQUESTS ==============

// Tạo request access vào private project
// POST /access-requests/projects/:projectId
router.post('/projects/:projectId', accessRequestController.requestAccess)

// Lấy danh sách access requests của project (cho admin)
// GET /access-requests/projects/:projectId
router.get(
  '/projects/:projectId',
  projectMiddleware.checkProjectPermission('add_member'),
  accessRequestController.getProjectRequests
)

// ============== ACCESS REQUEST ACTIONS ==============

// Admin approve access request
// PATCH /access-requests/:requestId/accept
router.patch('/:requestId/accept', accessRequestController.approveRequest)

// Admin reject access request
// PATCH /access-requests/:requestId/reject
router.patch('/:requestId/reject', accessRequestController.rejectRequest)

export const APIs_accessRequest = router
