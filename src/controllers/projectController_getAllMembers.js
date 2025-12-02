// Temporary file for getAllMembers controller
// Add this function to projectController.js after getProjectMembers

const { Logger } = require('concurrently')
const { StatusCodes } = require('http-status-codes')
const { projectService } = require('~/services/projectService')

export const getAllMembers = async (req, res, next) => {
  try {
    const userId = req.user._id
    const result = await projectService.getAllMembers(userId)
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Danh sách tất cả thành viên được lấy thành công',
      data: result,
    })
  } catch (error) {
    Logger.error(`Lỗi khi lấy danh sách tất cả thành viên: ${error.message}`)
    next(error)
  }
}
