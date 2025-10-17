import mongoose from 'mongoose'

/**
 * Safely ends a Mongoose session, preventing errors if it's already closed.
 * @param {import('mongoose').ClientSession} session The session to end.
 */
const safeEndSession = async (session) => {
  if (session) {
    try {
      // session.withTransaction handles commit/abort. We just need to end the session.
      await session.endSession()
    } catch (error) {
      // Ignore errors from trying to end a session that's already ended.
      if (error.name !== 'MongoExpiredSessionError') {
        // eslint-disable-next-line no-console
        console.error('Error ending session:', error)
      }
    }
  }
}

/**
 * Wraps a database operation in a Mongoose transaction, handling session creation,
 * commit/abort, and cleanup.
 * @param {Function} callback The function to execute within the transaction.
 * It will receive the session as an argument.
 * @returns The result of the callback function.
 */
export const withTransaction = async (callback) => {
  const session = await mongoose.startSession()
  try {
    let result
    await session.withTransaction(async () => {
      result = await callback(session)
    })
    return result
  } finally {
    await safeEndSession(session)
  }
}
