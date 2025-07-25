import express from 'express'
import { projectController } from '~/controllers/projectController'
import { projectMiddleware } from '~/middlewares/projectMiddleware'
// import { APIs_project } from './projectRoute';

const router = express.Router()

/**
 * Tạo dự án mới
 * @route POST /api/projects
 * @access Private
 */
router.post('/',
  projectMiddleware.ensureAuthenticated,
  projectMiddleware.validateCreate,
  projectController.createNew,
)

/**
 * Cập nhật thông tin dự án
 * @route PUT /api/projects/:id
 * @access Private
 */
router.put('/:id',
  projectMiddleware.ensureAuthenticated,
  projectMiddleware.checkPermission('can_edit'),
  projectMiddleware.validateUpdate,
  projectController.update,
)

/**
 * Xóa mềm dự án
 * @route DELETE /api/projects/:id
 * @access Private
 */
router.delete('/:id',
  projectMiddleware.ensureAuthenticated,
  projectMiddleware.checkPermission('can_delete'),
  projectController.deleteProject,
)

/**
 * Lấy danh sách dự án
 * @route GET /api/projects
 * @access Private
 */
router.get('/',
  projectMiddleware.ensureAuthenticated,
  projectController.getAllProjects,
)

/**
 * Lấy thông tin dự án theo ID
 * @route GET /api/projects/:id
 * @access Private
 */
router.get('/:id',
  projectMiddleware.ensureAuthenticated,
  projectController.getById,
)

/**
 * Thêm thành viên vào dự án
 * @route POST /api/projects/:id/members
 * @access Private
 */
router.post('/:id/members',
  projectMiddleware.ensureAuthenticated,
  projectMiddleware.checkPermission('can_add_member'),
  projectMiddleware.validateAddMember,
  projectController.addMember,
)

/**
 * Xóa thành viên khỏi dự án
 * @route DELETE /api/projects/:id/members/:userId
 * @access Private
 */
router.delete('/:id/members/:userId',
  projectMiddleware.ensureAuthenticated,
  projectMiddleware.checkPermission('can_add_member'),
  projectController.removeMember,
)

/**
 * Cập nhật vai trò của thành viên
 * @route PUT /api/projects/:id/members/:userId/role
 * @access Private
 */
router.put('/:id/members/:userId/role',
  projectMiddleware.ensureAuthenticated,
  projectMiddleware.checkPermission('can_add_member'),
  projectMiddleware.validateUpdateMemberRole,
  projectController.updateMemberRole,
)

export const APIs_project = router
