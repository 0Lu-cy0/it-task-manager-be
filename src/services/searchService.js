// src/services/searchService.js
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import { projectModel } from '~/models/projectModel'
import { taskModel } from '~/models/taskModel'
import { ColumnModel } from '~/models/columnModal'
import { authModel } from '~/models/authModel'
import ApiError from '~/utils/ApiError'
import { MESSAGES } from '~/constants/messages'
import { normalizeFilterArray, normalizeQuery, runFuseSearch } from '~/utils/searchUtils'

const SOURCE_LIMIT = 500

const toStringId = value => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof mongoose.Types.ObjectId) return value.toString()
  if (typeof value === 'object' && value._id) return value._id.toString()
  return null
}

const mapProjectResult = project => ({
  _id: project._id.toString(),
  name: project.name,
  description: project.description ?? null,
  status: project.status,
  priority: project.priority,
  member_count: project.member_count ?? 0,
  end_date: project.end_date ?? null,
})

const mapTaskResult = task => {
  const projectRef = task.project_id
  return {
    _id: task._id.toString(),
    name: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    project_id: toStringId(projectRef),
    project_name:
      projectRef && typeof projectRef === 'object' && 'name' in projectRef
        ? projectRef.name
        : undefined,
  }
}

const mapUserResult = user => ({
  _id: user._id.toString(),
  name: user.full_name || user.email,
  email: user.email,
  role: user.department || undefined,
})

const ensureProjectAccess = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, MESSAGES.PROJECT_ID_INVALID)
  }

  const project = await projectModel
    .findOne({ _id: projectId, _destroy: false })
    .select('name visibility members columnOrderIds')
    .lean()

  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.PROJECT_NOT_FOUND)
  }

  const isMember = project.members?.some(member => toStringId(member.user_id) === userId.toString())

  if (project.visibility !== 'public' && !isMember) {
    throw new ApiError(StatusCodes.FORBIDDEN, MESSAGES.FORBIDDEN)
  }

  return project
}

const sortCardsByOrder = (cards = [], orderIds = []) => {
  if (!cards.length) return []
  if (!orderIds.length) {
    return cards.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
  }

  const orderMap = new Map(orderIds.map((id, index) => [id, index]))
  return cards.slice().sort((a, b) => {
    const ai = orderMap.get(a._id) ?? Number.MAX_SAFE_INTEGER
    const bi = orderMap.get(b._id) ?? Number.MAX_SAFE_INTEGER
    if (ai === bi) {
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    }
    return ai - bi
  })
}

const parseDueEndFilter = value => {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return null
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  parsed.setHours(23, 59, 59, 999)
  return parsed
}

const normalizeText = value =>
  typeof value === 'string'
    ? value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    : ''

const textMatchesQuery = (text, normalizedQuery, normalizedQueryAscii) => {
  if (!text || !normalizedQuery) return false
  const lower = text.toLowerCase()
  if (lower.includes(normalizedQuery)) return true
  if (!normalizedQueryAscii) return false
  return normalizeText(lower).includes(normalizedQueryAscii)
}

const formatTaskCard = task => ({
  _id: task._id.toString(),
  tittle_card: task.title,
  description: task.description ?? null,
  status: task.status,
  priority: task.priority,
  project_id: toStringId(task.project_id),
  columnId: toStringId(task.columnId) ?? undefined,
  due_date: task.due_date ?? null,
  created_by: toStringId(task.created_by),
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  tags: task.tags ?? [],
})

const formatColumnWithCards = (column, cards, columnMatched, matchedCardIds = []) => {
  const cardOrderIds = (column.cardOrderIds || []).map(id => toStringId(id)).filter(Boolean)
  return {
    _id: toStringId(column._id),
    tittle_column: column.title,
    project_id: toStringId(column.project_id),
    createdBy: toStringId(column.createdBy),
    cardOrderIds,
    createdAt: column.createdAt,
    updatedAt: column.updatedAt,
    cards,
    matchMeta: {
      columnMatched,
      cardsMatched: matchedCardIds.length ? matchedCardIds : cards.map(card => card._id),
    },
  }
}

const orderColumns = (columns, orderIds = []) => {
  if (!columns.length) return []
  const columnMap = new Map(columns.map(column => [toStringId(column._id), column]))
  const ordered = []

  orderIds.forEach(id => {
    const column = columnMap.get(id)
    if (column) {
      ordered.push(column)
      columnMap.delete(id)
    }
  })

  columnMap.forEach(column => ordered.push(column))
  return ordered
}

const buildProjectFilter = (userId, filters) => {
  const statusFilters = normalizeFilterArray(filters.status)
  const priorityFilters = normalizeFilterArray(filters.priority)

  const filter = {
    _destroy: false,
    $or: [{ 'members.user_id': userId }, { visibility: 'public' }],
  }

  if (statusFilters.length) {
    filter.status = { $in: statusFilters }
  }

  if (priorityFilters.length) {
    filter.priority = { $in: priorityFilters }
  }

  return filter
}

const buildTaskFilter = (userId, filters) => {
  const statusFilters = normalizeFilterArray(filters.status)
  const priorityFilters = normalizeFilterArray(filters.priority)
  const projectFilters = normalizeFilterArray(filters.project_id)

  const filter = {
    _destroy: false,
    'assignees.user_id': userId,
  }

  if (statusFilters.length) {
    filter.status = { $in: statusFilters }
  }

  if (priorityFilters.length) {
    filter.priority = { $in: priorityFilters }
  }

  if (projectFilters.length) {
    const [projectId] = projectFilters
    if (mongoose.Types.ObjectId.isValid(projectId)) {
      filter.project_id = projectId
    }
  }

  return filter
}

const fetchProjects = async filter =>
  projectModel
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(SOURCE_LIMIT)
    .select('name description status priority member_count end_date')
    .lean()

const fetchTasks = async filter =>
  taskModel
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(SOURCE_LIMIT)
    .select('title description status priority project_id')
    .populate({ path: 'project_id', select: 'name' })
    .lean()

const fetchUsers = async userId =>
  authModel
    .find({ _destroy: false, _id: { $ne: userId } })
    .sort({ updatedAt: -1 })
    .limit(SOURCE_LIMIT)
    .select('full_name email department')
    .lean()

export const searchBoard = async (projectId, userId, query, filters = {}) => {
  const normalizedQuery = normalizeQuery(query)
  const normalizedQueryLower = normalizedQuery.toLowerCase()
  const normalizedQueryAscii = normalizeText(normalizedQuery)
  if (!normalizedQuery) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Query parameter q is required')
  }

  const project = await ensureProjectAccess(projectId, userId)
  const columns = await ColumnModel.find({ project_id: projectId }).lean()

  let tasks = await taskModel
    .find({ project_id: projectId, _destroy: false })
    .select(
      'title description status priority project_id columnId due_date created_by createdAt updatedAt tags'
    )
    .lean()

  const priorityFilters = normalizeFilterArray(filters.priority)
  if (priorityFilters.length) {
    tasks = tasks.filter(task => priorityFilters.includes(task.priority))
  }

  const dueEnd = parseDueEndFilter(filters.dueEnd)
  if (dueEnd) {
    tasks = tasks.filter(task => task.due_date && new Date(task.due_date) <= dueEnd)
  }

  const totalCards = tasks.length

  const formattedCards = tasks.map(formatTaskCard)
  const cardById = new Map(formattedCards.map(card => [card._id, card]))
  const cardsByColumnAll = new Map()

  formattedCards.forEach(card => {
    const columnId = card.columnId
    if (!columnId) return
    const bucket = cardsByColumnAll.get(columnId) || []
    bucket.push(card)
    cardsByColumnAll.set(columnId, bucket)
  })

  if (!totalCards) {
    return {
      columns: [],
      meta: {
        query: normalizedQuery,
        project: { _id: project._id.toString(), name: project.name },
        totalColumns: columns.length,
        matchedColumns: 0,
        totalCards: 0,
        matchedCards: 0,
      },
    }
  }

  const { results: matchedCardsList } = runFuseSearch({
    items: formattedCards,
    query: normalizedQuery,
    keys: ['tittle_card', 'description', 'tags'],
    limit: tasks.length || undefined,
    fuseOptions: { threshold: 0.35, minMatchCharLength: 1 },
  })

  const matchedCardsByColumn = new Map()
  matchedCardsList.forEach(card => {
    const cardId = toStringId(card._id)
    const formatted = cardById.get(cardId) || card
    const columnId = formatted.columnId
    if (!columnId) return
    const current = matchedCardsByColumn.get(columnId) || []
    current.push(formatted)
    matchedCardsByColumn.set(columnId, current)
  })

  const columnOrderIds = (project.columnOrderIds || []).map(id => toStringId(id)).filter(Boolean)
  const orderedColumns = orderColumns(columns, columnOrderIds)

  const matchedColumns = orderedColumns
    .map(column => {
      const columnId = toStringId(column._id)
      const matchedCards = matchedCardsByColumn.get(columnId) || []
      const columnMatched = textMatchesQuery(
        column.title,
        normalizedQueryLower,
        normalizedQueryAscii
      )

      if (!columnMatched && !matchedCards.length) return null

      const cardsSource = columnMatched
        ? cardsByColumnAll.get(columnId) || matchedCards
        : matchedCards

      const sortedCards = sortCardsByOrder(
        cardsSource,
        (column.cardOrderIds || []).map(id => toStringId(id)).filter(Boolean)
      )
      return formatColumnWithCards(
        column,
        sortedCards,
        columnMatched,
        matchedCards.map(card => card._id)
      )
    })
    .filter(Boolean)

  return {
    columns: matchedColumns,
    meta: {
      query: normalizedQuery,
      project: { _id: project._id.toString(), name: project.name },
      totalColumns: columns.length,
      matchedColumns: matchedColumns.length,
      totalCards,
      matchedCards: matchedCardsList.length,
    },
  }
}

export const searchProjects = async (query, userId, filters = {}) => {
  const normalizedQuery = normalizeQuery(query)
  if (!normalizedQuery) return []

  const projects = await fetchProjects(buildProjectFilter(userId, filters))
  const { results } = runFuseSearch({
    items: projects,
    query: normalizedQuery,
    keys: ['name', 'description'],
    limit: filters.limit,
    offset: filters.offset,
  })

  return results.map(mapProjectResult)
}

export const searchTasks = async (query, userId, filters = {}) => {
  const normalizedQuery = normalizeQuery(query)
  if (!normalizedQuery) return []

  const tasks = await fetchTasks(buildTaskFilter(userId, filters))
  const { results } = runFuseSearch({
    items: tasks,
    query: normalizedQuery,
    keys: ['title', 'description', 'project_id.name'],
    limit: filters.limit,
    offset: filters.offset,
  })

  return results.map(mapTaskResult)
}

export const searchUsers = async (query, userId, filters = {}) => {
  const normalizedQuery = normalizeQuery(query)
  if (!normalizedQuery) return []

  const users = await fetchUsers(userId)
  const { results } = runFuseSearch({
    items: users,
    query: normalizedQuery,
    keys: ['full_name', 'email'],
    limit: filters.limit,
    offset: filters.offset,
  })

  return results.map(mapUserResult)
}

export const globalSearch = async (query, userId, options = {}) => {
  const normalizedQuery = normalizeQuery(query)
  if (!normalizedQuery) {
    return { projects: [], tasks: [], users: [], total_results: 0 }
  }

  const [projects, tasks, users] = await Promise.all([
    searchProjects(normalizedQuery, userId, options),
    searchTasks(normalizedQuery, userId, options),
    searchUsers(normalizedQuery, userId, options),
  ])

  return {
    projects,
    tasks,
    users,
    total_results: projects.length + tasks.length + users.length,
  }
}

export const searchService = {
  searchProjects,
  searchTasks,
  globalSearch,
  searchUsers,
  searchBoard,
}
