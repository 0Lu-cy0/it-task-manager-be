// src/controllers/searchController.js
import { searchService } from '~/services/searchService'

const globalSearch = async (req, res, next) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query
    const userId = req.user._id.toString()

    const results = await searchService.globalSearch(q, userId, { limit, offset })

    res.status(200).json({
      status: 'success',
      data: {
        projects: results.projects,
        tasks: results.tasks,
        users: results.users,
      },
      meta: results.meta,
      query: q,
    })
  } catch (error) {
    next(error)
  }
}

const searchProjects = async (req, res, next) => {
  try {
    const { q, status, priority } = req.query
    const userId = req.user._id.toString()

    const results = await searchService.searchProjects(q, userId, { status, priority })

    res.status(200).json({
      status: 'success',
      data: results.items,
      meta: results.meta,
    })
  } catch (error) {
    next(error)
  }
}

const searchTasks = async (req, res, next) => {
  try {
    const { q, status, priority, project_id } = req.query
    const userId = req.user._id.toString()

    const results = await searchService.searchTasks(q, userId, { status, priority, project_id })

    res.status(200).json({
      status: 'success',
      data: results.items,
      meta: results.meta,
    })
  } catch (error) {
    next(error)
  }
}

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query
    const userId = req.user._id.toString()

    const results = await searchService.searchUsers(q, userId)

    res.status(200).json({
      status: 'success',
      data: results.items,
      meta: results.meta,
    })
  } catch (error) {
    next(error)
  }
}

const parseArrayParam = value => {
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

const searchBoard = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const { q = '', dueEnd, priority } = req.query
    const userId = req.user._id.toString()

    const filters = {
      dueEnd: typeof dueEnd === 'string' ? dueEnd : undefined,
      priorityFilter: parseArrayParam(priority),
    }

    const results = await searchService.searchBoard(projectId, userId, q, filters)

    res.status(200).json({
      status: 'success',
      data: results.columns,
      meta: results.meta,
      query: q,
    })
  } catch (error) {
    next(error)
  }
}

const searchBoard = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const { q, priority, dueEnd } = req.query
    const userId = req.user._id.toString()

    const results = await searchService.searchBoard(projectId, userId, q, {
      priority,
      dueEnd,
    })

    res.status(200).json({
      status: 'success',
      data: results,
    })
  } catch (error) {
    next(error)
  }
}

export const searchController = {
  globalSearch,
  searchProjects,
  searchTasks,
  searchUsers,
  searchBoard,
}
