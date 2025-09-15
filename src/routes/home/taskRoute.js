import express from 'express'
import { taskController } from '~/controllers/taskController'
import { taskMiddleware } from '~/middlewares/taskMiddleware'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

// Apply authentication middleware to all task routes
router.use(authMiddleware.isAuthenticated)

// Task CRUD routes
// Láy thông tin của tất cả các task
router.get('/', taskController.getTasks)
// Lấy thông tin task theo id
router.get('/:id', taskController.getTaskById)
// Tạo task mới
router.post('/', taskMiddleware.validateCreate, projectMiddleware.checkProjectPermission('create_task'), taskController.createTask)
// Cập nhật task
router.put('/:id', taskMiddleware.validateUpdate, taskController.updateTask)
// Xóa task
router.delete('/:id', taskController.deleteTask)

// Task management routes
router.post('/:id/assign', taskMiddleware.validateAssign, taskController.assignTask)

router.patch('/:id/status', taskMiddleware.validateStatusUpdate, taskController.updateTaskStatus)

export const APIs_task = router

