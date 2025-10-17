import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { notiController } from '~/controllers/notiController'
const router = express.Router()

router.use(authMiddleware.isAuthenticated)

// Lấy ra tất cả các thông báo người dùng có
router.get('/', notiController.getAllNoti)

// Xem chi tiết thông báo đó
router.get('/:notiId', notiController.getDetailNoti)

// Đánh dấu đã đọc
router.patch('/:notiId', notiController.markAsRead)

// Xóa thông báo đã đọc theo id
router.delete('/:notiId', notiController.deleteNoti)

// Xóa tất cả thông báo đã đọc
router.delete('/', notiController.deleteAllNoti)

export const APIs_notification = router
