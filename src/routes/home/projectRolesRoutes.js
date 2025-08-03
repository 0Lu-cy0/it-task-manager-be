import express from 'express'
import { projectRolesController } from '~/controllers/projectRolesController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { rolesMiddleware } from '~/middlewares/rolesMiddleware'

const router = express.Router()

router.get(
  '/projects/:projectId/roles',
  authMiddleware.verifyToken,
  rolesMiddleware.checkProjectPermission('view_project'), // Yêu cầu quyền xem dự án
  projectRolesController.getAll,
)
router.put(
  '/project-roles/:id',
  authMiddleware.verifyToken,
  rolesMiddleware.checkProjectPermission('change_member_role'), // Yêu cầu quyền thay đổi vai trò
  projectRolesController.update,
)

export const APIs_project_roles = router
