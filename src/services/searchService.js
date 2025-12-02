// src/services/searchService.js
import { getMeiliClient } from '~/config/meilisearch'
import { buildMeiliFilters } from '~/utils/searchUtils'
import { projectRepository } from '~/repository/projectRepository'
import { taskRepository } from '~/repository/taskRepository'
import { authRepository } from '~/repository/authRepository'

const DEFAULT_LIMIT = 20
const DEFAULT_OFFSET = 0

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

export const searchService = {
  searchProjects,
  searchTasks,
  globalSearch,
  searchUsers,
}
