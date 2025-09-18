import { projectModel } from '~/models/projectModel'
import { taskModel } from '~/models/taskModel'

const findAll = async (userId) => {
  // Đếm số project có user trong members
  const count_of_project = await projectModel.countDocuments({
    _destroy: false,
    'members.user_id': userId,
  })

  // Đếm số task mà user là người tạo hoặc được assign
  const count_of_task = await taskModel.countDocuments({
    _destroy: false,
    $or: [
      { created_by: userId },
      { 'assignees.user_id': userId },
    ],
  })

  return { count_of_project, count_of_task }
}

const lastProjectActivity = async (userId) => {
  return await projectModel.find({ 'members.user_id': userId }).sort({ last_activity: -1 }).limit(5)
}

export const dashboardRepository = {
  findAll,
  lastProjectActivity,
}
