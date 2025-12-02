import mongoose from 'mongoose'
import { projectModel } from '~/models/projectModel'
import { taskModel } from '~/models/taskModel'
import { serverLogModel } from '~/models/serverLogModel'
import { authModel } from '~/models/authModel'

const toObjectId = id => new mongoose.Types.ObjectId(id)

const findAll = async userId => {
  // Đếm số project có user trong members
  const count_of_project = await projectModel.countDocuments({
    _destroy: false,
    'members.user_id': userId,
  })

  // Đếm số task mà user là người tạo hoặc được assign
  const count_of_task = await taskModel.countDocuments({
    _destroy: false,
    $or: [{ created_by: userId }, { 'assignees.user_id': userId }],
  })

  return { count_of_project, count_of_task }
}

const lastProjectActivity = async userId => {
  return await projectModel.find({ 'members.user_id': userId }).sort({ last_activity: -1 }).limit(5)
}

const getProjectSummarySnapshot = async (projectId, { sinceDate, dueSoonStart, dueSoonEnd }) => {
  const projectObjectId = toObjectId(projectId)
  const [snapshot] = await taskModel.aggregate([
    {
      $match: {
        project_id: projectObjectId,
        _destroy: false,
      },
    },
    {
      $facet: {
        statusBreakdown: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        priorityBreakdown: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        typesOfWork: [
          {
            $group: {
              _id: { $ifNull: ['$type', 'task'] },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ],
        totalTasks: [{ $group: { _id: null, count: { $sum: 1 } } }],
        created: [
          { $match: { createdAt: { $gte: sinceDate } } },
          { $count: 'count' },
        ],
        updated: [
          { $match: { updatedAt: { $gte: sinceDate } } },
          { $count: 'count' },
        ],
        completed: [
          { $match: { completed_at: { $gte: sinceDate } } },
          { $count: 'count' },
        ],
        dueSoon: [
          { $match: { due_date: { $gte: dueSoonStart, $lte: dueSoonEnd } } },
          { $count: 'count' },
        ],
      },
    },
  ])

  return {
    statusBreakdown: snapshot?.statusBreakdown || [],
    priorityBreakdown: snapshot?.priorityBreakdown || [],
    typesOfWork: snapshot?.typesOfWork || [],
    stats: {
      created: snapshot?.created?.[0]?.count || 0,
      updated: snapshot?.updated?.[0]?.count || 0,
      completed: snapshot?.completed?.[0]?.count || 0,
      dueSoon: snapshot?.dueSoon?.[0]?.count || 0,
    },
    totalTasks: snapshot?.totalTasks?.[0]?.count || 0,
  }
}

const getTeamWorkloadSnapshot = async projectId => {
  const projectObjectId = toObjectId(projectId)
  const [result] = await taskModel.aggregate([
    {
      $match: {
        project_id: projectObjectId,
        _destroy: false,
      },
    },
    {
      $facet: {
        assignments: [
          {
            $unwind: {
              path: '$assignees',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: '$assignees.user_id',
              tasks: { $sum: 1 },
            },
          },
          { $sort: { tasks: -1 } },
        ],
        totalTasks: [{ $count: 'count' }],
      },
    },
  ])

  return {
    assignments: result?.assignments || [],
    totalTasks: result?.totalTasks?.[0]?.count || 0,
  }
}

const findUsersMinimal = async userIds => {
  if (!userIds || userIds.length === 0) return []
  return await authModel
    .find(
      { _id: { $in: userIds } },
      { full_name: 1, email: 1, avatar_url: 1, department: 1, username: 1 }
    )
    .lean()
    .exec()
}

const getProjectActivityLogs = async (projectId, limit) => {
  return await serverLogModel
    .find({ project: toObjectId(projectId), _destroy: false })
    .populate('user', 'full_name email avatar_url department username')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec()
}

export const dashboardRepository = {
  findAll,
  lastProjectActivity,
  getProjectSummarySnapshot,
  getTeamWorkloadSnapshot,
  findUsersMinimal,
  getProjectActivityLogs,
}
