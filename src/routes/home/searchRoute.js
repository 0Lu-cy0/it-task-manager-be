// src/routes/home/searchRoute.js
import express from 'express'
import { searchController } from '~/controllers/searchController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.use(authMiddleware.isAuthenticated)

router.get('/search', searchController.globalSearch)
router.get('/search/projects', searchController.searchProjects)
router.get('/search/tasks', searchController.searchTasks)
router.get('/search/users', searchController.searchUsers)

export const APIs_search = router
