import { serverLogModel } from '~/models/serverLogModel'

/**
 * Tạo log mới
 */
const createLog = async data => {
  return await serverLogModel.create(data)
}

/**
 * Lấy tất cả logs với phân trang
 */
const getAllLogs = async (page = 1, limit = 50, filters = {}) => {
  const skip = (page - 1) * limit
  const query = { _destroy: false, ...filters }

  const logs = await serverLogModel
    .find(query)
    .populate('user', 'email full_name department')
    .populate('project', 'project_name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()

  const total = await serverLogModel.countDocuments(query)

  return {
    logs,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_items: total,
      items_per_page: limit,
    },
  }
}

export const serverLogRepository = {
  createLog,
  getAllLogs,
}
