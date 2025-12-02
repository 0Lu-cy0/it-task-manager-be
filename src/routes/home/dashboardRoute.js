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

// Tổng quan summary cho 1 project cụ thể
router.get('/projects/:projectId/summary', dashboardController.getProjectSummary)

// Workload theo thành viên
router.get('/projects/:projectId/workload', dashboardController.getTeamWorkload)

// Activity feed từ server logs
router.get('/projects/:projectId/activity', dashboardController.getProjectActivity)

export const APIs_dashboard = router
