import express from 'express'
import { serverLogController } from '~/controllers/serverLogController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

// ============== SERVER LOGS ==============

/**
 * Lấy danh sách logs
 * GET /logs
 * Query params:
 * - page: số trang (mặc định: 1)
 * - limit: số log mỗi trang (mặc định: 50, tối đa: 100)
 * - userId: lọc theo user ID (tùy chọn)
 * - projectId: lọc theo project ID (tùy chọn)
 */
router.get('/', authMiddleware.isAuthenticated, serverLogController.getLogs)

/**
 * Lấy log theo ID
 * GET /logs/:id
 */
router.get('/:id', authMiddleware.isAuthenticated, serverLogController.getLogById)

/**
 * Tạo log mới
 * POST /logs
 * Body: { content: string, projectId?: string, logHistory?: string }
 */
router.post('/', authMiddleware.isAuthenticated, serverLogController.createLog)

export const serverLogRoute = router
