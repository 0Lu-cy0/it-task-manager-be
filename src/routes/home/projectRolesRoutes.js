import express from 'express'
import rateLimit from 'express-rate-limit' // Thêm thư viện này nếu chưa có
import { projectRoleController } from '~/controllers/projectRolesController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { projectRoleMiddleware } from '~/middlewares/projectRoleMiddleware'

const router = express.Router()

// Thêm rate limiting (giới hạn 100 request mỗi 15 phút)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 request mỗi IP
})
router.use(limiter)

// Thêm permission vào role
router.post(
  '/:projectId/roles/:roleId/permissions',
  authMiddleware.verifyToken,
  projectRoleMiddleware.checkProjectPermission('change_member_role'),
  projectRoleMiddleware.validateAddPermission,
  projectRoleController.addPermission,
)

// Xóa permission khỏi role
router.delete(
  '/:projectId/roles/:roleId/permissions/:permissionId',
  authMiddleware.verifyToken,
  projectRoleMiddleware.checkProjectPermission('change_member_role'),
  projectRoleMiddleware.validateRemovePermission,
  projectRoleController.removePermission,
)

// Lấy danh sách permission của role
router.get(
  '/:projectId/roles/:roleId/permissions',
  authMiddleware.verifyToken,
  projectRoleMiddleware.checkProjectPermission('view_project'),
  projectRoleMiddleware.validateGetPermissions,
  projectRoleController.getPermissions,
)

// // Giữ route từ file của bạn
// router.get(
//   '/projects/:projectId/roles',
//   authMiddleware.verifyToken,
//   projectRoleMiddleware.checkProjectPermission('view_project'),
//   projectRoleController.getAll,
// )

// router.put(
//   '/:projectId/roles/:id', // Sửa để bao gồm projectId, nhất quán hơn
//   authMiddleware.verifyToken,
//   projectRoleMiddleware.checkProjectPermission('change_member_role'),
//   projectRoleMiddleware.validateUpdate,
//   projectRoleController.update,
// )
//JKhoong phải gán mới mà là sửa, vì mặc định khi vào dự án là 1 user luôn có 1 role nhất định
// Gán role cho member trong project
// router.post(
//   '/:projectId/members/:memberId/role',
//   authMiddleware.verifyToken,
//   projectRoleMiddleware.checkProjectPermission('change_member_role'),
//   projectRoleMiddleware.validateAssignRole,
//   projectRoleController.assignRole,
// )

export const APIs_project_roles = router
