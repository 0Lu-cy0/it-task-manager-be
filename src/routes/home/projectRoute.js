import express from 'express'
import { projectController } from '~/controllers/projectController'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

/**
 * Tạo dự án mới  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 */
router.post('/', authMiddleware.isAuthenticated, projectMiddleware.validateCreate, projectController.createNew)

/**
 * Cập nhật thông tin dự án  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 */
router.put('/:projectId', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('edit_project'), projectMiddleware.validateUpdate, projectController.update)

/**
 * Xóa mềm dự án  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 */
router.delete('/:projectId', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('delete_project'), projectController.deleteProject)

/**
 * Lấy danh sách dự án  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 */
router.get('/', authMiddleware.isAuthenticated, projectController.getAllProjects)

/**
 * Lấy thông tin chi tiết dự án theo ID  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 */
router.get('/:projectId', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('view_project'), projectController.getById)

/**
 * Xóa thành viên khỏi dự án
 */
router.delete('/:projectId/members/:userId', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('can_add_member'), projectController.removeMember)

/**
 * Cập nhật vai trò của 1 hoặc nhiều thành viên cùng 1 lúc
 */
router.put('/:projectId/roles', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('change_member_role'), projectMiddleware.validateUpdateMemberRole, projectController.updateMemberRole)

// //Ủy quyền cho owner có thể tùy chỉnh permission theo ý muốn mà không bị giới hạn
// router.patch('/:projectId/free-mode', authMiddleware.verifyToken, projectMiddleware.checkProjectPermission('toggle_free_mode'), projectMiddleware.checkIsOwner, projectController.toggleFreeMode,
// )
/**
 * Lấy danh sách vai trò của dự án
 */
router.get('/:projectId/roles', authMiddleware.isAuthenticated, projectController.getProjectRoles)

// /**
//  * Lấy thông tin lead của dự án
//  */
// router.get('/:projectId/lead', authMiddleware.isAuthenticated, projectController.getProjectLead)

router.patch('/:projectId/free-mode', authMiddleware.isAuthenticated, projectMiddleware.checkIsOwner, projectController.toggleFreeMode)

export const APIs_project = router
