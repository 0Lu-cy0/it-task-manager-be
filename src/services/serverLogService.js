import { StatusCodes } from 'http-status-codes'
import { serverLogRepository } from '~/repository/serverLogRepository'
import { ApiError } from '~/utils/ApiError'

/**
 * Tạo log mới
 */
const createLog = async (userId, data) => {
  const logData = {
    user: userId,
    content: data.content,
    project: data.projectId || null,
    logHistory: data.logHistory || null,
  }

  const log = await serverLogRepository.createLog(logData)
  return log
}

/**
 * Lấy tất cả logs hoặc logs theo user
 */
const getLogs = async (query = {}) => {
  const { page = 1, limit = 50, userId, projectId } = query

  const filters = {}
  if (userId) filters.user = userId
  if (projectId) filters.project = projectId

  return await serverLogRepository.getAllLogs(page, limit, filters)
}

/**
 * Lấy log theo ID
 */
const getLogById = async logId => {
  const log = await serverLogRepository.findLogById(logId)
  if (!log) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy log')
  }
  return log
}

export const serverLogService = {
  createLog,
  getLogs,
  getLogById,
}
