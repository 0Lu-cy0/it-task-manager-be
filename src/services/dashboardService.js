/* eslint-disable no-useless-catch */
import { dashboardRepository } from '~/repository/dashboardRepository'
import { projectRepository } from '~/repository/projectRepository'
import { ApiError } from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { MESSAGES } from '~/constants/messages'

const STATUS_LABELS = {
  todo: 'To do',
  in_progress: 'In progress',
  testing: 'Testing',
  completed: 'Completed',
}

const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const TYPE_LABELS = {
  task: 'Task',
  story: 'Story',
  bug: 'Bug',
  subtask: 'Subtask',
  asset: 'Asset',
  epic: 'Epic',
  research: 'Research',
  other: 'Other',
}

const percentage = (value, total) => {
  if (!total || total === 0) return 0
  return Number(((value / total) * 100).toFixed(2))
}

const ensureProjectAccess = async (projectId, userId) => {
  const project = await projectRepository.findById(projectId)
  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }

  const isMember = project.members?.some(member => member.user_id?.toString() === String(userId))
  if (project.visibility !== 'public' && !isMember) {
    throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  }

  return {
    _id: project._id,
    name: project.name,
    visibility: project.visibility,
  }
}

const formatBreakdown = (raw = [], dictionary = {}, total = 0) => {
  return Object.entries(dictionary).map(([key, label]) => {
    const entry = raw.find(item => String(item._id) === key)
    const count = entry?.count || 0
    return { key, label, count, percentage: percentage(count, total) }
  })
}

const getAllInfor = async userId => {
  return await dashboardRepository.findAll(userId)
}
const getRecentProject = async userId => {
  return await dashboardRepository.lastProjectActivity(userId)
}

const getProjectSummary = async (userId, { projectId, rangeDays = 7, dueInDays = 7, typeLimit = 4 }) => {
  const project = await ensureProjectAccess(projectId, userId)
  const now = new Date()
  const sinceDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000)
  const dueSoonEnd = new Date(now.getTime() + dueInDays * 24 * 60 * 60 * 1000)

  const snapshot = await dashboardRepository.getProjectSummarySnapshot(projectId, {
    sinceDate,
    dueSoonStart: now,
    dueSoonEnd,
  })

  const statusBreakdown = formatBreakdown(snapshot.statusBreakdown, STATUS_LABELS, snapshot.totalTasks)
  const priorityBreakdown = formatBreakdown(
    snapshot.priorityBreakdown,
    PRIORITY_LABELS,
    snapshot.totalTasks
  )

  const typeBuckets = snapshot.typesOfWork || []
  const typesTotal = typeBuckets.reduce((sum, item) => sum + item.count, 0)
  const typesOfWork = typeBuckets
    .slice(0, typeLimit)
    .map(item => ({
      key: item._id || 'task',
      label: TYPE_LABELS[item._id] || TYPE_LABELS.other,
      count: item.count,
      percentage: percentage(item.count, typesTotal || snapshot.totalTasks),
    }))

  return {
    project,
    range: {
      days: rangeDays,
      since: sinceDate,
      until: now,
    },
    dueSoon: {
      days: dueInDays,
      start: now,
      end: dueSoonEnd,
    },
    totals: {
      tasks: snapshot.totalTasks,
    },
    stats: snapshot.stats,
    statusOverview: {
      total: snapshot.totalTasks,
      breakdown: statusBreakdown,
    },
    priorityBreakdown,
    typesOfWork,
  }
}

const getTeamWorkload = async (userId, { projectId, limit = 10 }) => {
  const project = await ensureProjectAccess(projectId, userId)
  const snapshot = await dashboardRepository.getTeamWorkloadSnapshot(projectId)

  const assignments = snapshot.assignments || []
  let unassignedCount = 0
  const assigneeRows = []

  assignments.forEach(item => {
    if (!item._id) {
      unassignedCount += item.tasks
    } else {
      assigneeRows.push(item)
    }
  })

  const userIds = assigneeRows.map(item => item._id)
  const users = await dashboardRepository.findUsersMinimal(userIds)
  const userMap = new Map(users.map(user => [String(user._id), user]))

  const distributionDenominator = assigneeRows.reduce((sum, item) => sum + item.tasks, 0) + unassignedCount

  const members = assigneeRows.map(item => {
    const user = userMap.get(String(item._id)) || {}
    return {
      user_id: item._id,
      full_name: user.full_name || user.username || user.email || 'Unknown user',
      email: user.email || null,
      avatar_url: user.avatar_url || null,
      department: user.department || null,
      tasks: item.tasks,
      percentage: percentage(item.tasks, distributionDenominator || item.tasks || 1),
    }
  })

  return {
    project,
    totals: {
      tasks: snapshot.totalTasks,
      assignments: distributionDenominator,
    },
    members: members.slice(0, limit),
    unassigned: {
      tasks: unassignedCount,
      percentage: percentage(unassignedCount, distributionDenominator || unassignedCount || 1),
    },
  }
}

const getProjectActivity = async (userId, { projectId, limit = 20 }) => {
  const project = await ensureProjectAccess(projectId, userId)
  const logs = await dashboardRepository.getProjectActivityLogs(projectId, limit)
  return {
    project,
    logs,
  }
}

export const dashboardService = {
  getAllInfor,
  getRecentProject,
  getProjectSummary,
  getTeamWorkload,
  getProjectActivity,
}
