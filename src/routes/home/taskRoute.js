import express from 'express'
import { taskController } from '~/controllers/taskController'
import { taskMiddleware } from '~/middlewares/taskMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

// Apply authentication middleware to all task routes
router.use(authMiddleware.verifyToken)

// Task CRUD routes
router.post('/', taskMiddleware.validateCreate, taskController.createTask)
router.put('/:id', taskMiddleware.validateUpdate, taskController.updateTask)
router.delete('/:id', taskController.deleteTask)
router.get('/:id', taskController.getTaskById)
router.get('/', taskController.getTasks)

// Task management routes
router.post('/:id/assign', taskMiddleware.validateAssign, taskController.assignTask)
router.patch('/:id/status', taskMiddleware.validateStatusUpdate, taskController.updateTaskStatus)

export const APIs_task = router
