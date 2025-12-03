// src/services/searchService.js
import { getMeiliClient } from '~/config/meilisearch'
import { buildMeiliFilters } from '~/utils/searchUtils'
import { projectRepository } from '~/repository/projectRepository'
import { taskRepository } from '~/repository/taskRepository'
import { authRepository } from '~/repository/authRepository'
import { toProjectDocument, toTaskDocument, toUserDocument } from '~/repository/searchRepository'
import { columnService } from '~/services/columnService'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const DEFAULT_LIMIT = 20
const DEFAULT_OFFSET = 0
let projectSearchSettingsEnsured = false

const waitForIndexTask = async (index, taskUid) => {
  if (!taskUid) return
  if (typeof index.waitForTask === 'function') {
    await index.waitForTask(taskUid)
    return
  }
  const client = getMeiliClient()
  if (typeof client.waitForTask === 'function') {
    await client.waitForTask(taskUid)
  }
}

const extractId = hit => {
  if (!hit) return null
  if (hit._id) return hit._id.toString()
  if (hit.id) return hit.id.toString()
  return null
}

const orderDocuments = (ids, docs) => {
  const map = new Map(docs.map(doc => [doc._id.toString(), doc]))
  return ids.map(id => map.get(id)).filter(Boolean)
}

const formatSearchResponse = (meiliResponse = {}, entities = []) => {
  const sanitizeNumber = (value, fallback) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
  }

  const meta = {
    total: meiliResponse.estimatedTotalHits ?? meiliResponse.hits?.length ?? entities.length,
    limit: sanitizeNumber(meiliResponse.limit, DEFAULT_LIMIT),
    offset: sanitizeNumber(meiliResponse.offset, DEFAULT_OFFSET),
    processingTimeMs: meiliResponse.processingTimeMs ?? 0,
    query: meiliResponse.query ?? '',
  }

  return {
    items: entities,
    meta,
  }
}

const normalizeObjectId = value => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value.toString === 'function') return value.toString()
  if (value._id && typeof value._id.toString === 'function') return value._id.toString()
  return null
}

const userCanAccessProject = (project, userId) => {
  if (!project) return false
  if (project.visibility === 'public') return true
  const ownerId = normalizeObjectId(project.created_by)
  if (ownerId && ownerId === userId) return true
  const members = Array.isArray(project.members) ? project.members : []
  return members.some(member => normalizeObjectId(member.user_id) === userId)
}

const toEndOfDay = value => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(23, 59, 59, 999)
  return date
}

const ensureProjectNameSearchableAttribute = async index => {
  if (projectSearchSettingsEnsured) return

  const settings = await index.getSettings()
  const searchableAttributes = settings?.searchableAttributes || []
  const isAlreadyNameOnly = searchableAttributes.length === 1 && searchableAttributes[0] === 'name'

  if (!isAlreadyNameOnly) {
    const task = await index.updateSettings({ searchableAttributes: ['name'] })
    const taskUid = task?.taskUid ?? task?.updateId
    await waitForIndexTask(index, taskUid)
  }

  projectSearchSettingsEnsured = true
}

const addDocumentsAndWait = async (index, documents) => {
  if (!Array.isArray(documents) || documents.length === 0) return null
  const task = await index.addDocuments(documents, { primaryKey: 'id' })
  const taskUid = task?.taskUid ?? task?.updateId
  await waitForIndexTask(index, taskUid)
  return taskUid
}

const searchUsers = async (query = '', _userId, filters = {}) => {
  void _userId
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('users')
  const limit = Number(filters.limit ?? DEFAULT_LIMIT)
  const offset = Number(filters.offset ?? DEFAULT_OFFSET)

  const searchResponse = await index.search(query, {
    limit,
    offset,
  })

  const ids = (searchResponse.hits || []).map(extractId).filter(Boolean)
  const users = await authRepository.findUsersByIds(ids)
  const orderedUsers = orderDocuments(ids, users)

  return formatSearchResponse(searchResponse, orderedUsers)
}

const searchProjects = async (query = '', userId, filters = {}) => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('projects')

  await ensureProjectNameSearchableAttribute(index)

  const visibilityFilter = `(members.user_id = "${userId}" OR visibility = "public")`
  const additionalFilters = buildMeiliFilters(filters)
  const limit = Number(filters.limit ?? DEFAULT_LIMIT)
  const offset = Number(filters.offset ?? DEFAULT_OFFSET)

  const filterClauses = [visibilityFilter, ...additionalFilters].filter(Boolean)

  const searchResponse = await index.search(query, {
    limit,
    offset,
    filter: filterClauses.length ? filterClauses : undefined,
    attributesToSearchOn: ['name'],
    attributesToHighlight: ['name', 'description'],
  })

  const ids = (searchResponse.hits || []).map(extractId).filter(Boolean)
  const projects = await projectRepository.findByIds(ids)
  const orderedProjects = orderDocuments(ids, projects)

  return formatSearchResponse(searchResponse, orderedProjects)
}

const searchTasks = async (query = '', userId, filters = {}) => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('tasks')
  const limit = Number(filters.limit ?? DEFAULT_LIMIT)
  const offset = Number(filters.offset ?? DEFAULT_OFFSET)

  const baseFilters = [`assignees.user_id = "${userId}"`]
  const additionalFilters = buildMeiliFilters(filters)
  const filterClauses = [...baseFilters, ...additionalFilters].filter(Boolean)

  const searchResponse = await index.search(query, {
    limit,
    offset,
    filter: filterClauses.length ? filterClauses : undefined,
    attributesToHighlight: ['title', 'description'],
    facets: ['status', 'priority', 'project_id'],
  })

  const ids = (searchResponse.hits || []).map(extractId).filter(Boolean)
  const tasks = await taskRepository.findByIds(ids)
  const orderedTasks = orderDocuments(ids, tasks)

  return formatSearchResponse(searchResponse, orderedTasks)
}

const globalSearch = async (query = '', userId, pagination = {}) => {
  const [projectResult, taskResult, userResult] = await Promise.all([
    searchProjects(query, userId, pagination),
    searchTasks(query, userId, pagination),
    searchUsers(query, userId, pagination),
  ])

  return {
    projects: projectResult.items,
    tasks: taskResult.items,
    users: userResult.items,
    meta: {
      projects: projectResult.meta,
      tasks: taskResult.meta,
      users: userResult.meta,
    },
  }
}

const searchBoard = async (projectId, userId, query = '', options = {}) => {
  if (!projectId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'projectId is required')
  }

  const trimmedQuery = (query || '').trim()
  const normalizedQuery = trimmedQuery.toLowerCase()
  const priorityFilter = Array.isArray(options.priorityFilter)
    ? options.priorityFilter.map(value => value.toLowerCase()).filter(Boolean)
    : []
  const dueEndDate = toEndOfDay(options.dueEnd)

  const hasPriorityFilter = priorityFilter.length > 0
  const hasDueFilter = Boolean(dueEndDate)
  const hasQuery = Boolean(normalizedQuery)

  if (!hasQuery && !hasPriorityFilter && !hasDueFilter) {
    return {
      columns: [],
      meta: {
        query: '',
        totalColumns: 0,
        totalCards: 0,
        matchedColumns: 0,
        matchedCards: 0,
      },
    }
  }

  const project = await projectRepository.findById(projectId)
  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy dự án')
  }

  if (!userCanAccessProject(project, userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập dự án này')
  }

  const columnsWithCards = await columnService.getColumnsByProject(projectId)

  const matchedColumns = []
  let matchedCardsCount = 0

  columnsWithCards.forEach(column => {
    const cards = Array.isArray(column.cards) ? column.cards : []
    const filteredCards = cards.filter(card => {
      if (hasPriorityFilter) {
        const cardPriority = (card.priority || '').toLowerCase()
        if (!priorityFilter.includes(cardPriority)) return false
      }

      if (hasDueFilter) {
        if (!card.due_date) return false
        const dueDate = new Date(card.due_date)
        if (Number.isNaN(dueDate.getTime())) return false
        if (dueEndDate && dueDate > dueEndDate) return false
      }

      return true
    })

    if (!hasQuery && filteredCards.length === 0) {
      return
    }

    const columnMatched = hasQuery
      ? (column.title || '').toLowerCase().includes(normalizedQuery)
      : false

    const cardsMatched = hasQuery
      ? filteredCards.filter(card =>
        (card.title || card.name || '').toLowerCase().includes(normalizedQuery)
      )
      : filteredCards

    if (hasQuery && !columnMatched && cardsMatched.length === 0) {
      return
    }

    const visibleCards = columnMatched ? filteredCards : cardsMatched
    matchedCardsCount += visibleCards.length

    matchedColumns.push({
      ...column,
      cards: visibleCards,
      cardOrderIds: visibleCards.map(card => normalizeObjectId(card._id)).filter(Boolean),
      matchMeta: {
        columnMatched,
        cardsMatched: cardsMatched.map(card => normalizeObjectId(card._id)).filter(Boolean),
      },
    })
  })

  return {
    columns: matchedColumns,
    meta: {
      query: trimmedQuery,
      totalColumns: matchedColumns.length,
      totalCards: matchedCardsCount,
      matchedColumns: matchedColumns.length,
      matchedCards: matchedCardsCount,
      filters: {
        priority: priorityFilter,
        dueEnd: dueEndDate ? dueEndDate.toISOString() : null,
      },
    },
  }
}

const syncData = async () => {
  const meiliClient = getMeiliClient()

  const [projects, tasks, users] = await Promise.all([
    projectRepository.getAll({ _destroy: false }),
    taskRepository.findTasks({}),
    authRepository.findAllActiveUsers(),
  ])

  const projectDocs = projects.map(toProjectDocument).filter(Boolean)
  const taskDocs = tasks.map(toTaskDocument).filter(Boolean)
  const userDocs = users.map(toUserDocument).filter(Boolean)

  const projectIndex = meiliClient.index('projects')
  await ensureProjectNameSearchableAttribute(projectIndex)
  await addDocumentsAndWait(projectIndex, projectDocs)

  const taskIndex = meiliClient.index('tasks')
  await addDocumentsAndWait(taskIndex, taskDocs)

  const userIndex = meiliClient.index('users')
  await addDocumentsAndWait(userIndex, userDocs)

  return {
    projects: projectDocs.length,
    tasks: taskDocs.length,
    users: userDocs.length,
  }
}

export const searchService = {
  searchProjects,
  searchTasks,
  globalSearch,
  searchUsers,
  searchBoard,
  syncData,
}
