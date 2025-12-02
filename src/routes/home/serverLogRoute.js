import express from 'express'
import { serverLogController } from '~/controllers/serverLogController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

// ============== SERVER LOGS ==============

/**
 * Lấy logs của một user trong project
 * GET /logs/projects/:projectId/users/:userId
 * Query params:
 * - page: số trang (mặc định: 1)
 * - limit: số log mỗi trang (mặc định: 50, tối đa: 100)
 */
router.get(
  '/projects/:projectId/users/:userId',
  authMiddleware.isAuthenticated,
  serverLogController.getLogs
)

/**
 * Tạo log mới
 * POST /logs
 * Body: { content: string, projectId: string, logHistory?: string }
 */
router.post('/', authMiddleware.isAuthenticated, serverLogController.createLog)

export const serverLogRoute = router
