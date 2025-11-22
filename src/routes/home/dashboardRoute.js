import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { dashboardController } from '~/controllers/dashboardController'

const router = express.Router()

router.use(authMiddleware.isAuthenticated)

// ============== DASHBOARD OVERVIEW ==============

// Lấy thông tin tổng quan dashboard
// GET /dashboards (hoặc /dashboards/overview)
router.get('/', dashboardController.getAllInfor)

// Lấy danh sách projects gần đây (3 ngày)
// GET /dashboards/projects/recent (RESTful: resource là projects, filter là recent)
router.get('/projects/recent', dashboardController.getRecentProject)

export const APIs_dashboard = router
