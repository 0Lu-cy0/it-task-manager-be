import mongoose from 'mongoose'
import { env } from '~/config/environment'

// Kết nối đến MongoDB bằng Mongoose
export const CONNECT_DB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME,
    })

    console.log('✅ Connected to MongoDB successfully!')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message)
    console.error('❌ Full Error:', error)
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
