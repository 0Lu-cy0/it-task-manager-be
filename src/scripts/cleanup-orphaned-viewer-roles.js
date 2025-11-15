import { CONNECT_DB, CLOSE_DB } from '../config/mongodb.js'
import { projectModel } from '../models/projectModel.js'
import { projectRolesModel } from '../models/projectRolesModel.js'

/**
 * Script cleanup: Xóa các viewer role không thuộc project nào (orphaned)
 *
 * Cách chạy:
 * npm run migrate:cleanup-orphaned
 */

async function cleanupOrphanedViewerRoles() {
  // eslint-disable-next-line no-console
  console.log('🧹 Bắt đầu cleanup orphaned viewer roles...\n')

  await CONNECT_DB()

  try {
    // Tìm tất cả viewer roles
    const viewerRoles = await projectRolesModel.find({
      name: 'viewer',
      _destroy: false,
    })

    // eslint-disable-next-line no-console
    console.log(`📊 Tổng số viewer roles: ${viewerRoles.length}`)

    const orphanedRoles = []

    for (const viewerRole of viewerRoles) {
      const project = await projectModel.findById(viewerRole.project_id)
      if (!project) {
        orphanedRoles.push(viewerRole)
      }
    }

    // eslint-disable-next-line no-console
    console.log(`🗑️  Số orphaned viewer roles: ${orphanedRoles.length}\n`)

    if (orphanedRoles.length === 0) {
      // eslint-disable-next-line no-console
      console.log('✅ Không có orphaned viewer roles nào.')
      return
    }

    // eslint-disable-next-line no-console
    console.log('📋 Danh sách orphaned roles sẽ bị xóa:')
    orphanedRoles.forEach(role => {
      // eslint-disable-next-line no-console
      console.log(`   - ${role._id} (project_id: ${role.project_id})`)
    })
    // eslint-disable-next-line no-console
    console.log('')

    // Xóa các orphaned roles
    const roleIds = orphanedRoles.map(role => role._id)
    const deleteResult = await projectRolesModel.deleteMany({
      _id: { $in: roleIds },
    })

    // eslint-disable-next-line no-console
    console.log(`✅ Đã xóa ${deleteResult.deletedCount} orphaned viewer roles`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Lỗi:', error)
    throw error
  } finally {
    await CLOSE_DB()
    // eslint-disable-next-line no-console
    console.log('\n✅ Hoàn tất cleanup.\n')
  }
}

// Chạy script
cleanupOrphanedViewerRoles()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error('❌ Script thất bại:', error)
    process.exit(1)
  })
