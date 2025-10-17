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
router.get('/:projectId/:id',
  projectMiddleware.checkProjectPermission('view_task'),
  taskController.getTaskById)
// Tạo task mới
router.post('/:projectId',
  taskMiddleware.validateCreate,
  projectMiddleware.checkProjectPermission('create_task'),
  taskController.createTask)
// Cập nhật task
router.put('/:projectId/:id',
  taskMiddleware.validateUpdate,
  projectMiddleware.checkProjectPermission('edit_task'),
  taskController.updateTask)
// Xóa task
router.delete('/:projectId/:id',
  projectMiddleware.checkProjectPermission('delete_task'),
  taskController.deleteTask)

// Gán thành viên dự án vào task
router.post('/:projectId/:id/assign',
  projectMiddleware.checkProjectPermission('assign_task'),
  taskMiddleware.validateAssign,
  taskController.assignTask)
// Gỡ thành viên dự án ra khỏi task
router.post('/:projectId/:id/unassign',
  projectMiddleware.checkProjectPermission('unassign_task'),
  taskMiddleware.validateUnassign,
  taskController.unassignTask)
// Điều chỉnh trạng thái của task
router.patch('/:projectId/:id/status',
  projectMiddleware.checkProjectPermission('status_task'),
  taskMiddleware.validateStatusUpdate,
  taskController.updateTaskStatus)

export const APIs_task = router

