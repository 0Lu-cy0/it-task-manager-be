import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { notiController } from '~/controllers/notiController'

const router = express.Router()

router.use(authMiddleware.isAuthenticated)

// ============== NOTIFICATIONS CRUD ==============

// Lấy tất cả thông báo của user hiện tại
// GET /noti
router.get('/', notiController.getAllNoti)

// Lấy chi tiết một thông báo
// GET /noti/:notiId
router.get('/:notiId', notiController.getDetailNoti)

// Cập nhật trạng thái thông báo (đánh dấu đã đọc)
// PATCH /noti/:notiId (RESTful: PATCH để update một phần)
router.patch('/:notiId', notiController.markAsRead)

// Xóa một thông báo
// DELETE /noti/:notiId
router.delete('/:notiId', notiController.deleteNoti)

// Xóa tất cả thông báo đã đọc
// DELETE /noti (với query param hoặc body filter)
router.delete('/', notiController.deleteAllNoti)

export const APIs_notification = router
