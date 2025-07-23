import mongoose from 'mongoose'
import { env } from '~/config/environment'

// Kết nối đến MongoDB bằng Mongoose
export const CONNECT_DB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME,
    })
  } catch (error) {
    process.exit(1)
  }
}

// Đóng kết nối khi cần thiết
export const CLOSE_DB = async () => {
  try {
    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error)
  }
}
