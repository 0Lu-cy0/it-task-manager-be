import express from 'express'
import { taskController } from '~/controllers/taskController'
import { taskMiddleware } from '~/middlewares/taskMiddleware'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.use(authMiddleware.isAuthenticated)

// ============== TASK CRUD ==============

// Lấy danh sách tất cả tasks (có thể filter bằng query params)
// GET /tasks?projectId=xxx&status=xxx
router.get('/', taskController.getTasks)

// Lấy task cụ thể theo ID
// GET /tasks/projects/:projectId/:id
router.get(
  '/projects/:projectId/:id',
  projectMiddleware.checkProjectPermission('view_task'),
  taskController.getTaskById
)

// Tạo task mới trong project
// POST /tasks/projects/:projectId
router.post(
  '/projects/:projectId',
  taskMiddleware.validateCreate,
  projectMiddleware.checkProjectPermission('create_task'),
  taskController.createTask
)

// Cập nhật thông tin task
// PUT /tasks/projects/:projectId/:id
router.put(
  '/projects/:projectId/:id',
  taskMiddleware.validateUpdate,
  projectMiddleware.checkProjectPermission('edit_task'),
  taskController.updateTask
)

// Xóa task
// DELETE /tasks/projects/:projectId/:id
router.delete(
  '/projects/:projectId/:id',
  projectMiddleware.checkProjectPermission('delete_task'),
  taskController.deleteTask
)

// ============== TASK ASSIGNMENTS ==============

// Gán thành viên vào task
// POST /tasks/projects/:projectId/:id/assignments (RESTful: resource là assignments)
router.post(
  '/projects/:projectId/:id/assignments',
  projectMiddleware.checkProjectPermission('assign_task'),
  taskMiddleware.validateAssign,
  taskController.assignTask
)

// Gỡ thành viên khỏi task
// DELETE /tasks/projects/:projectId/:id/assignments (RESTful: DELETE assignments)
router.delete(
  '/projects/:projectId/:id/assignments',
  projectMiddleware.checkProjectPermission('unassign_task'),
  taskMiddleware.validateUnassign,
  taskController.unassignTask
)

// ============== TASK STATUS ==============

// Cập nhật trạng thái task
// PATCH /tasks/projects/:projectId/:id/status (RESTful: PATCH một field cụ thể)
router.patch(
  '/projects/:projectId/:id/status',
  projectMiddleware.checkProjectPermission('status_task'),
  taskMiddleware.validateStatusUpdate,
  taskController.updateTaskStatus
)

export const APIs_task = router
