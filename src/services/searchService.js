// src/services/searchService.js
import { getMeiliClient } from '~/config/meilisearch'
import { buildMeiliFilters } from '~/utils/searchUtils'

const searchUsers = async (query, userId) => {
  const meiliClient = getMeiliClient()
  // Placeholder for user search logic
  // eslint-disable-next-line no-console
  console.log('Searching for users with query:', query, 'by user:', userId)
  const index = meiliClient.index('users')
  return await index.search(query)
}

export const searchProjects = async (query, userId, filters = {}) => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('projects')

  const searchResults = await index.search(query, {
    filter: [`members.user_id = "${userId}"`, ...buildMeiliFilters(filters)],
    attributesToHighlight: ['name', 'description'],
    limit: 20,
  })

  return searchResults
}

export const searchTasks = async (query, userId, filters = {}) => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('tasks')

  return await index.search(query, {
    filter: [`assignees.user_id = "${userId}"`, ...buildMeiliFilters(filters)],
    attributesToHighlight: ['title', 'description'],
    facets: ['status', 'priority', 'project_id'],
  })
}

export const globalSearch = async (query, userId) => {
  const [projects, tasks, users] = await Promise.all([
    searchProjects(query, userId),
    searchTasks(query, userId),
    searchUsers(query, userId),
  ])

  return { projects, tasks, users }
}

export const searchService = {
  searchProjects,
  searchTasks,
  globalSearch,
  searchUsers,
}
