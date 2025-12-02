/* eslint-disable no-console */
/**
 * Script để fix lỗi duplicate key error trên invite_token
 * Xóa unique index cũ và tạo lại index mới với sparse: true
 *
 * Chạy: node --require @babel/register src/scripts/fix-invite-token-index.js
 */

import mongoose from 'mongoose'
import { env } from '~/config/environment'
import { inviteModel } from '~/models/inviteModel'

const fixInviteTokenIndex = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME,
    })
    console.log('✅ Connected to MongoDB')

    console.log('\n🔍 Checking existing indexes...')
    const indexes = await inviteModel.collection.getIndexes()
    console.log('Current indexes:', Object.keys(indexes))

    // Xóa unique index cũ trên invite_token nếu tồn tại
    if (indexes.invite_token_1) {
      console.log('\n🗑️  Dropping old invite_token_1 index...')
      await inviteModel.collection.dropIndex('invite_token_1')
      console.log('✅ Dropped invite_token_1 index')
    }

    // Tạo lại index mới với sparse: true (cho phép nhiều null values)
    console.log('\n🔨 Creating new sparse index on invite_token...')
    await inviteModel.collection.createIndex(
      { invite_token: 1 },
      {
        sparse: true, // Cho phép nhiều null values
        background: true,
        name: 'invite_token_1_sparse',
      }
    )
    console.log('✅ Created new sparse index: invite_token_1_sparse')

    console.log('\n🔍 Verifying new indexes...')
    const newIndexes = await inviteModel.collection.getIndexes()
    console.log('Updated indexes:', Object.keys(newIndexes))

    console.log('\n✨ Index fix completed successfully!')
    console.log('📝 Note: Email invites will be deleted after acceptance')
  } catch (error) {
    console.error('❌ Error fixing index:', error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 MongoDB connection closed')
  }
}

// Run the script
fixInviteTokenIndex()
  .then(() => {
    console.log('\n🎉 Script finished successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
