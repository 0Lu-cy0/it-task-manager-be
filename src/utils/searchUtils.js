// src/utils/searchUtils.js
import Fuse from 'fuse.js'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

const DEFAULT_FUSE_OPTIONS = {
  shouldSort: true,
  includeScore: false,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

export const normalizeQuery = query => (typeof query === 'string' ? query.trim() : '')

export const normalizeFilterArray = value => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? item.trim() : String(item)))
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }
  return [String(value)].filter(Boolean)
}

export const normalizePagination = ({ limit, offset } = {}) => {
  const parsedLimit = Number(limit)
  const parsedOffset = Number(offset)

  const safeLimit = Number.isFinite(parsedLimit) ? parsedLimit : DEFAULT_LIMIT
  const safeOffset = Number.isFinite(parsedOffset) ? parsedOffset : 0

  return {
    limit: Math.min(Math.max(safeLimit, 1), MAX_LIMIT),
    offset: Math.max(safeOffset, 0),
  }
}

export const runFuseSearch = ({
  items = [],
  query = '',
  keys = [],
  limit,
  offset,
  fuseOptions = {},
} = {}) => {
  const normalizedQuery = normalizeQuery(query)
  const { limit: safeLimit, offset: safeOffset } = normalizePagination({ limit, offset })

  if (!normalizedQuery) {
    const slice = items.slice(safeOffset, safeOffset + safeLimit)
    return { results: slice, total: items.length }
  }

  const fuse = new Fuse(items, { ...DEFAULT_FUSE_OPTIONS, ...fuseOptions, keys })
  const hits = fuse.search(normalizedQuery)
  const slice = hits.slice(safeOffset, safeOffset + safeLimit).map(hit => hit.item)
  return { results: slice, total: hits.length }
}
