// src/utils/searchUtils.js
export const setupMeiliIndexes = async () => {
  const { getMeiliClient } = await import('~/config/meilisearch')
  const meiliClient = getMeiliClient()

  const waitForTask = async (index, taskPromise) => {
    const task = await taskPromise
    const taskUid = task?.taskUid ?? task?.updateId
    if (!taskUid) return
    if (typeof index.waitForTask === 'function') {
      await index.waitForTask(taskUid)
      return
    }
    if (typeof meiliClient.waitForTask === 'function') {
      await meiliClient.waitForTask(taskUid)
    }
  }

  // Setup Projects index (restrict search to the `name` field)
  const projectsIndex = meiliClient.index('projects')
  await waitForTask(
    projectsIndex,
    projectsIndex.updateSettings({
      searchableAttributes: ['name'],
      filterableAttributes: ['status', 'priority', 'members.user_id', 'visibility'],
      sortableAttributes: ['created_at', 'name'],
    })
  )

  // Setup Tasks index
  const tasksIndex = meiliClient.index('tasks')
  await waitForTask(
    tasksIndex,
    tasksIndex.updateSettings({
      searchableAttributes: ['title', 'description', 'tags'],
      filterableAttributes: ['status', 'priority', 'project_id', 'assignees.user_id'],
      sortableAttributes: ['created_at', 'due_date'],
    })
  )

  // Setup Users index
  const usersIndex = meiliClient.index('users')
  await waitForTask(
    usersIndex,
    usersIndex.updateSettings({
      searchableAttributes: ['displayName', 'email'],
      filterableAttributes: [],
      sortableAttributes: ['createdAt'],
    })
  )
}

const normalizeToArray = value => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

const buildOrClause = (field, values) => {
  if (!Array.isArray(values) || values.length === 0) return null
  if (values.length === 1) return `${field} = "${values[0]}"`
  const clauses = values.map(value => `${field} = "${value}"`).join(' OR ')
  return `(${clauses})`
}

export const buildMeiliFilters = filters => {
  const conditions = []

  const statusValues = normalizeToArray(filters.status)
  const priorityValues = normalizeToArray(filters.priority)
  const projectValues = normalizeToArray(filters.project_id)

  const statusClause = buildOrClause('status', statusValues)
  if (statusClause) conditions.push(statusClause)

  const priorityClause = buildOrClause('priority', priorityValues)
  if (priorityClause) conditions.push(priorityClause)

  const projectClause = buildOrClause('project_id', projectValues)
  if (projectClause) conditions.push(projectClause)

  return conditions
}
