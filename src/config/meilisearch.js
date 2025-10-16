// src/config/meilisearch.js
import { MeiliSearch } from 'meilisearch'
import { env } from '~/config/environment'

let meiliClient = null

export const getMeiliClient = () => {
  if (!meiliClient) {
    meiliClient = new MeiliSearch({
      host: env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: env.MEILISEARCH_API_KEY,
    })
  }
  return meiliClient
}
