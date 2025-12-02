import 'dotenv/config'
import { CONNECT_DB, CLOSE_DB } from '../config/mongodb'
import { setupMeiliIndexes } from '../utils/searchUtils'
import { searchService } from '../services/searchService'
import { getMeiliClient } from '../config/meilisearch'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const waitForMeili = async ({ retries = 20, delayMs = 500 } = {}) => {
  const client = getMeiliClient()

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const healthy = await client.isHealthy()
      if (healthy) return true
    } catch (error) {
      if (attempt === retries) throw error
    }
    await wait(delayMs)
  }
  return false
}

const run = async () => {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting MongoDB -> MeiliSearch sync...')

  await CONNECT_DB()

  try {
    await waitForMeili()
    await setupMeiliIndexes()
    const summary = await searchService.syncData()
    // eslint-disable-next-line no-console
    console.log('✅ Sync completed:', summary)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Sync failed:', error)
    throw error
  } finally {
    await CLOSE_DB()
  }
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch(() => {
    process.exit(1)
  })
