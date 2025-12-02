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

export const buildMeiliFilters = filters => {
  const conditions = []

  if (filters.status) conditions.push(`status = "${filters.status}"`)
  if (filters.priority) conditions.push(`priority = "${filters.priority}"`)
  if (filters.project_id) conditions.push(`project_id = "${filters.project_id}"`)

  return conditions
}
