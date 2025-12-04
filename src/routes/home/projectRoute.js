import express from 'express'
import { projectController } from '~/controllers/projectController'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()
router.use(authMiddleware.isAuthenticated)
//Tạo dự án mới
router.post('/', projectMiddleware.validateCreate, projectController.createNew)

/**
 * Cập nhật thông tin dự án
 */
router.put(
  '/:projectId',
  projectMiddleware.checkProjectPermission('edit_project'),
  projectMiddleware.validateUpdate,
  projectController.update
)

/**
 * Xóa mềm dự án
 */
router.delete(
  '/:projectId',
  projectMiddleware.checkProjectPermission('delete_project'),
  projectController.deleteProject
)

/**
 * Lấy danh sách dự án
 */
router.get('/', projectController.getAllProjects)

/**
 * Lấy thông tin chi tiết dự án theo ID
 */
router.get(
  '/:projectId',
  projectMiddleware.checkProjectPermission('view_project'),
  projectController.getById
)

/**
 * Xóa thành viên khỏi dự án
 */
router.delete(
  '/:projectId/members/:userId',
  projectMiddleware.checkProjectPermission('can_add_member'),
  projectController.removeMember
)

/**
 * Lấy danh sách vai trò của dự án
 */
router.get('/:projectId/roles', projectController.getProjectRoles)

/**
 * Lấy danh sách tất cả thành viên từ các project user tham gia
 * GET /projects/members/all
 * QUAN TRỌNG: Route này phải đặt TRƯỚC /:projectId/members
 */
router.get('/members/all', projectController.getAllMembers)

/**
 * Lấy danh sách thành viên của dự án (public - ai cũng có thể xem)
 * GET /projects/:projectId/members
 */
router.get('/:projectId/members', projectController.getProjectMembers)

/**
 * Cập nhật vai trò của thành viên trong dự án
 * PUT /projects/:projectId/members/roles (RESTful: resource là members/roles)
 */
router.put(
  '/:projectId/members/roles',
  projectMiddleware.checkProjectPermission('change_member_role'),
  projectMiddleware.validateUpdateMemberRole,
  projectController.updateMemberRole
)

/**
 * Toggle free mode setting (RESTful: PATCH resource settings)
 * PATCH /projects/:projectId/settings
 */
router.patch(
  '/:projectId/settings',
  projectMiddleware.checkIsOwner,
  projectController.toggleFreeMode
)
// Project đánh dấu sao
router.patch('/:projectId/favorite', projectController.toggleFavorite)

/**
 * Reorder columns in project
 * PATCH /projects/:projectId/columns/order
 */
router.patch(
  '/:projectId/columns/order',
  projectMiddleware.checkProjectPermission('edit_project'),
  projectController.reorderColumns
)

export const APIs_project = router
