// src/utils/searchUtils.js
export const setupMeiliIndexes = async () => {
  const { getMeiliClient } = await import('~/config/meilisearch')
  const meiliClient = getMeiliClient()

  // Setup Projects index
  const projectsIndex = meiliClient.index('projects')
  await projectsIndex.updateSettings({
    searchableAttributes: ['name', 'description'],
    filterableAttributes: ['status', 'priority', 'members.user_id', 'visibility'],
    sortableAttributes: ['created_at', 'name'],
  })

  // Setup Tasks index
  const tasksIndex = meiliClient.index('tasks')
  await tasksIndex.updateSettings({
    searchableAttributes: ['title', 'description', 'tags'],
    filterableAttributes: ['status', 'priority', 'project_id', 'assignees.user_id'],
    sortableAttributes: ['created_at', 'due_date'],
  })

  // Setup Users index
  const usersIndex = meiliClient.index('users')
  await usersIndex.updateSettings({
    searchableAttributes: ['displayName', 'email'],
    filterableAttributes: [],
    sortableAttributes: ['createdAt'],
  })
}

export const buildMeiliFilters = filters => {
  const conditions = []

  if (filters.status) conditions.push(`status = "${filters.status}"`)
  if (filters.priority) conditions.push(`priority = "${filters.priority}"`)
  if (filters.project_id) conditions.push(`project_id = "${filters.project_id}"`)

  return conditions
}
