import express from 'express'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

// Apply authentication middleware to all column routes
router.use(authMiddleware.isAuthenticated)

// POST /move-card - di chuyển card (đặt trước các route động)
router.post('/move-card', columnController.moveCard)

// POST /:projectId - tạo column mới cho project
router.post('/:projectId', columnController.create)

// GET /:columnId - lấy column kèm cards
router.get('/:columnId', columnController.getColumn)

// PUT /:columnId - cập nhật column
router.put('/:columnId', columnController.update)

// DELETE /:columnId - xóa column
router.delete('/:columnId', columnController.delete)

router.get('/projects/:projectId', columnController.getColumnsByProject)

export const APIs_column = router
