// src/repository/searchRepository.js
import { getMeiliClient } from '~/config/meilisearch'

const normalizeId = value => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value.toString === 'function') return value.toString()
  if (value._id && typeof value._id.toString === 'function') return value._id.toString()
  return null
}

const ensureArray = value => (Array.isArray(value) ? value : [])

export const toProjectDocument = project => {
  const id = normalizeId(project?._id)
  if (!id) return null

  const members = ensureArray(project?.members).map(member => ({
    user_id: normalizeId(member.user_id),
    role: normalizeId(member.project_role_id) ?? member.project_role_id,
  }))

  return {
    id,
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'planning',
    priority: project.priority || 'medium',
    visibility: project.visibility || 'private',
    members: members.filter(member => Boolean(member.user_id)),
    created_at: project.created_at || project.createdAt || null,
    updated_at: project.updated_at || project.updatedAt || null,
  }
}

export const toTaskDocument = task => {
  const id = normalizeId(task?._id)
  if (!id) return null

  const assignees = ensureArray(task?.assignees).map(assignee => ({
    user_id: normalizeId(assignee.user_id),
  }))

  return {
    id,
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    project_id: normalizeId(task.project_id),
    assignees: assignees.filter(assignee => Boolean(assignee.user_id)),
    tags: ensureArray(task.tags),
    due_date: task.due_date || null,
    created_at: task.created_at || task.createdAt || null,
    updated_at: task.updated_at || task.updatedAt || null,
  }
}

export const toUserDocument = user => {
  const id = normalizeId(user?._id)
  if (!id) return null

  const displayName = (user.full_name || user.name || '').trim()

  return {
    id,
    displayName: displayName || user.email,
    email: user.email,
    avatar_url: user.avatar_url || null,
  }
}

export const syncProjectToMeili = async project => {
  const document = toProjectDocument(project)
  if (!document) return

  const meiliClient = getMeiliClient()
  const index = meiliClient.index('projects')
  await index.addDocuments([document], { primaryKey: 'id' })
}

export const deleteProjectFromMeili = async projectId => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('projects')
  await index.deleteDocument(projectId.toString())
}

export const syncTaskToMeili = async task => {
  const document = toTaskDocument(task)
  if (!document) return

  const meiliClient = getMeiliClient()
  const index = meiliClient.index('tasks')
  await index.addDocuments([document], { primaryKey: 'id' })
}

export const deleteTaskFromMeili = async taskId => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('tasks')
  await index.deleteDocument(taskId.toString())
}
