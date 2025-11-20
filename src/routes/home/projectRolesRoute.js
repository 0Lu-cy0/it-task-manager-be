import express from 'express'
import rateLimit from 'express-rate-limit'
import { projectRoleController } from '~/controllers/projectRolesController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { projectRoleMiddleware } from '~/middlewares/projectRoleMiddleware'

const router = express.Router()

// Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
router.use(limiter)
router.use(authMiddleware.isAuthenticated)

// ============== PROJECT ROLES ==============

// Lấy danh sách tất cả roles trong project
// GET /project-roles/projects/:projectId/roles
router.get(
  '/projects/:projectId/roles',
  projectRoleMiddleware.checkProjectPermission('view_project'),
  projectRoleController.getAll
)

// ============== PROJECT ROLE PERMISSIONS ==============

// Lấy danh sách permissions của một role
// GET /project-roles/projects/:projectId/roles/:roleId/permissions
router.get(
  '/projects/:projectId/roles/:roleId/permissions',
  projectRoleMiddleware.checkProjectPermission('view_project'),
  projectRoleMiddleware.validateGetPermissions,
  projectRoleController.getPermissions
)

// Thêm permission vào role
// POST /project-roles/projects/:projectId/roles/:roleId/permissions
router.post(
  '/projects/:projectId/roles/:roleId/permissions',
  projectRoleMiddleware.checkProjectPermission('edit_permission_role'),
  projectRoleMiddleware.validateAddPermission,
  projectRoleController.addPermission
)

// Xóa permission khỏi role
// DELETE /project-roles/projects/:projectId/roles/:roleId/permissions/:permissionId
router.delete(
  '/projects/:projectId/roles/:roleId/permissions/:permissionId',
  projectRoleMiddleware.checkProjectPermission('edit_permission_role'),
  projectRoleMiddleware.validateRemovePermission,
  projectRoleController.removePermission
)

export const APIs_project_roles = router
