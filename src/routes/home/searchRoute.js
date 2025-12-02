// src/routes/home/searchRoute.js
import express from 'express'
import { searchController } from '~/controllers/searchController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.use(authMiddleware.isAuthenticated)

// ============== SEARCH ENDPOINTS ==============
// ✅ RESTful: Sử dụng query parameters cho search

// Tìm kiếm toàn bộ (projects, tasks, users)
// GET /search?q=keyword
router.get('/', searchController.globalSearch)

// Tìm kiếm chỉ projects
// GET /search/projects?q=keyword
router.get('/projects', searchController.searchProjects)

// Tìm kiếm chỉ tasks
// GET /search/tasks?q=keyword
router.get('/tasks', searchController.searchTasks)

// Tìm kiếm chỉ users
// GET /search/users?q=keyword
router.get('/users', searchController.searchUsers)

export const APIs_search = router
