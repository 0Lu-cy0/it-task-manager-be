import express from 'express'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.use(authMiddleware.isAuthenticated)

// ============== PROJECT COLUMNS ==============

// Lấy tất cả columns của một project
// GET /columns/projects/:projectId (RESTful: đặt trước routes động)
router.get('/projects/:projectId', columnController.getColumnsByProject)

// Tạo column mới cho project
// POST /columns/projects/:projectId
router.post('/projects/:projectId', columnController.create)

// ============== COLUMN OPERATIONS ==============

// Di chuyển card giữa các columns
// PATCH /columns/cards/move (RESTful: PATCH để update vị trí)
router.patch('/cards/move', columnController.moveCard)

// Lấy column cụ thể kèm cards
// GET /columns/:columnId
router.get('/:columnId', columnController.getColumn)

// Cập nhật thông tin column
// PUT /columns/:columnId
router.put('/:columnId', columnController.update)

// Xóa column
// DELETE /columns/:columnId
router.delete('/:columnId', columnController.delete)

export const APIs_column = router
