// src/repository/searchRepository.js
import { getMeiliClient } from '~/config/meilisearch'

export const syncProjectToMeili = async project => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('projects')

  const document = {
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    members: project.members.map(m => ({
      user_id: m.user_id.toString(),
      role: m.project_role_id,
    })),
    created_at: project.created_at,
  }

  await index.addDocuments([document], { primaryKey: 'id' })
}

export const deleteProjectFromMeili = async projectId => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('projects')
  await index.deleteDocument(projectId.toString())
}

export const syncTaskToMeili = async task => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('tasks')

  const document = {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    project_id: task.project_id.toString(),
    assignees: task.assignees.map(a => ({
      user_id: a.user_id.toString(),
    })),
    tags: task.tags,
  }

  await index.addDocuments([document], { primaryKey: 'id' })
}

export const deleteTaskFromMeili = async taskId => {
  const meiliClient = getMeiliClient()
  const index = meiliClient.index('tasks')
  await index.deleteDocument(taskId.toString())
}
