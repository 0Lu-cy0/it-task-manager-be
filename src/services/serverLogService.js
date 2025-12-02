import { serverLogRepository } from '~/repository/serverLogRepository'

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
  const filters = {
    project: projectId,
    user: userId,
  }

  return await serverLogRepository.getAllLogs(page, limit, filters)
}

export const serverLogService = {
  createLog,
  getLogs,
}
