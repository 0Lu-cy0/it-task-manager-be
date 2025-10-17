import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { dashboardController } from '~/controllers/dashboardController'
const router = express.Router()

router.use(authMiddleware.isAuthenticated)

// Lấy thông tin tổng quan
router.get('/', dashboardController.getAllInfor)

// Lấy thông tin project 3 ngày gần đây
router.get('/recent', dashboardController.getRecentProject)

export const APIs_dashboard = router
