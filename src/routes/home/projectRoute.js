import express from 'express'
import { projectController } from '~/controllers/projectController'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

// Apply authentication middleware to all project routes
router.use(authMiddleware.verifyToken)

// Project CRUD routes
router.post('/', projectMiddleware.validateCreate, projectController.createNew)
router.put('/:id', projectMiddleware.validateUpdate, projectController.update)
router.delete('/:id', projectController.deleteProject)
router.get('/:id', projectController.getById)
router.get('/', projectController.getAllProjects)

// Project member management
router.post('/:id/members', projectMiddleware.validateAddMember, projectController.addMember)
router.delete('/:id/members/:userId', projectController.removeMember)
router.put('/:id/members/:userId/role', projectMiddleware.validateUpdateMemberRole, projectController.updateMemberRole)

export const APIs_project = router
