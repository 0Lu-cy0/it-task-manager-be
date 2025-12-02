import { StatusCodes } from 'http-status-codes'
import { serverLogService } from '~/services/serverLogService'
import { serverLogValidation } from '~/validations/serverLogValidation'

/**
 * Tạo log mới
 * POST /logs
 */
const createLog = async (req, res, next) => {
  try {
    const data = await serverLogValidation.validateCreateLog(req.body)
    const log = await serverLogService.createLog(req.user._id, data)
    res.status(StatusCodes.CREATED).json({
      message: 'Tạo log thành công',
      data: log,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Lấy danh sách logs theo project & user
 * GET /logs/projects/:projectId/users/:userId
 */
const getLogs = async (req, res, next) => {
  try {
    const params = serverLogValidation.validateGetLogsParams(req.params)
    const pagination = serverLogValidation.validateGetLogsQuery(req.query)
    const result = await serverLogService.getLogs({ ...params, ...pagination })
    res.status(StatusCodes.OK).json({
      message: 'Lấy danh sách logs thành công',
      data: result.logs,
      pagination: result.pagination,
    })
  } catch (error) {
    next(error)
  }
}

export const serverLogController = {
  createLog,
  getLogs,
}
