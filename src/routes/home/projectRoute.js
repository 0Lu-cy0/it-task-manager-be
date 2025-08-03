import express from 'express'
import { projectController } from '~/controllers/projectController'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

/**
 * Tạo dự án mới  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 * @route POST /api/projects
 * @access Private
 */
router.post('/', authMiddleware.isAuthenticated, projectMiddleware.validateCreate, projectController.createNew)

/**
 * Cập nhật thông tin dự án  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 * @route PUT /api/projects/:id
 * @access Private
 * @note Trước khi gửi data về BE, nhất là kiểu dữ liệu date, nên convert lại bằng toISOString()
 */
router.put('/:projectId', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('edit_project'), projectMiddleware.validateUpdate, projectController.update)

/**
 * Xóa mềm dự án  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 * @route DELETE /api/projects/:projectId
 * @access Private
 */
router.delete('/:projectId', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('delete_project'), projectController.deleteProject)

/**
 * Lấy danh sách dự án  ✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔✔
 * @route GET /api/projects
 * @access Private
 */
router.get('/', authMiddleware.isAuthenticated, projectController.getAllProjects)

/**
 * Lấy thông tin dự án theo ID
 * @route GET /api/projects/:id
 * @access Private
 */
router.get('/:projectId', authMiddleware.isAuthenticated, projectController.getById)

/**
 * Thêm thành viên vào dự án
 * @route POST /api/projects/:id/members
 * @access Private
 */
router.post('/:projectId/members', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('can_add_member'), projectMiddleware.validateAddMember, projectController.addMember)

/**
 * Xóa thành viên khỏi dự án
 * @route DELETE /api/projects/:id/members/:userId
 * @access Private
 */
router.delete('/:projectId/members/:userId', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('can_add_member'), projectController.removeMember)

/**
 * Cập nhật vai trò của thành viên
 * @route PUT /api/projects/:id/members/:userId/role
 * @access Private
 */
router.put('/:projectId/members/:userId/role', authMiddleware.isAuthenticated, projectMiddleware.checkProjectPermission('change_member_role'), projectMiddleware.validateUpdateMemberRole, projectController.updateMemberRole)

/**
 * Lấy danh sách vai trò của dự án
 * @route GET /api/projects/:id/roles
 * @access Private
 */
router.get('/:projectId/roles', authMiddleware.isAuthenticated, projectController.getProjectRoles)

/**
 * Lấy thông tin lead của dự án
 * @route GET /api/projects/:id/lead
 * @access Private
 */
router.get('/:projectId/lead', authMiddleware.isAuthenticated, projectController.getProjectLead)

export const APIs_project = router
