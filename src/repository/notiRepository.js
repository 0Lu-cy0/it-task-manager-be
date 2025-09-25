import { notificationModel } from '~/models/notificationModel'

/**
 * Đánh dấu thông báo đã đọc
 */
const markAsRead = async (notiId) => {
  return await notificationModel.findByIdAndUpdate(
    notiId,
    { $set: { read: true } },
    { new: true },
  )
}

/**
 * Xóa thông báo
 */
const deleteNoti = async (notiId) => {
  return await notificationModel.findByIdAndDelete(
    notiId,
    { read: true },
    { new: true },
  )
}

// Xóa nhiều thông báo
const deleteAllNoti = async () => {
  return await notificationModel.deleteMany({ read: true })
}

/**
 * Lấy thông tin chi tiết của noti theo ID
 */
const getNotiById = async (notiId) => {
  return await notificationModel
    .findById(notiId)
    .populate('user_id', 'username full_name avatar_url')
    .lean()
}

/**
 * Tìm kiếm danh sách noti
 */
const findNoti = async (userId) => {
  return await notificationModel
    .find({ user_id: userId })
    .populate('user_id', 'username full_name avatar_url')
    .sort({ created_at: -1 })
    .lean()
}

export const notiRepository = {
  markAsRead,
  deleteNoti,
  getNotiById,
  findNoti,
  deleteAllNoti,
}
