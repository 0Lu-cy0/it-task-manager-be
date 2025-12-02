// Add this route to projectRoute.js BEFORE the /:projectId/members route

const { Router } = require('express')
const { projectController } = require('~/controllers/projectController')

/**
 * Lấy danh sách tất cả thành viên từ các project user tham gia
 * GET /projects/members/all
 */
Router.get('/members/all', projectController.getAllMembers)
