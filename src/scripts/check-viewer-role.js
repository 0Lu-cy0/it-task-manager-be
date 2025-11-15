import { CONNECT_DB, CLOSE_DB } from '../config/mongodb.js'
import { projectModel } from '../models/projectModel.js'
import { projectRolesModel } from '../models/projectRolesModel.js'
import { authModel } from '../models/authModel.js'

/**
 * Script kiểm tra: Xem có bao nhiêu viewer role trong database
 *
 * Cách chạy:
 * node --experimental-specifier-resolution=node src/scripts/check-viewer-role.js
 */

async function checkViewerRole() {
  // eslint-disable-next-line no-console
  console.log('🔍 Kiểm tra viewer role trong database...\n')

  await CONNECT_DB()

  try {
    // Đếm số viewer roles
    const viewerRoles = await projectRolesModel.find({
      name: 'viewer',
      _destroy: false,
    })

    // eslint-disable-next-line no-console
    console.log(`📊 Tổng số viewer roles: ${viewerRoles.length}\n`)

    if (viewerRoles.length === 0) {
      // eslint-disable-next-line no-console
      console.log('✅ Không có viewer role nào trong database.')
      return
    }

    // Kiểm tra từng project
    // eslint-disable-next-line no-console
    console.log('📋 Chi tiết theo từng project:\n')

    let totalUsersWithViewer = 0

    for (const viewerRole of viewerRoles) {
      const project = await projectModel.findById(viewerRole.project_id)
      if (!project) {
        // eslint-disable-next-line no-console
        console.log(`⚠️  Viewer role ${viewerRole._id} không thuộc project nào (orphaned)`)
        continue
      }

      const usersWithViewer = project.members.filter(
        member => member.project_role_id.toString() === viewerRole._id.toString()
      )

      // eslint-disable-next-line no-console
      console.log(`   Project: "${project.name}" (${project._id})`)
      // eslint-disable-next-line no-console
      console.log(`   - Viewer Role ID: ${viewerRole._id}`)
      // eslint-disable-next-line no-console
      console.log(`   - Số users có viewer role: ${usersWithViewer.length}`)

      if (usersWithViewer.length > 0) {
        totalUsersWithViewer += usersWithViewer.length
        // eslint-disable-next-line no-console
        console.log('   - Users:')
        for (const member of usersWithViewer) {
          const user = await authModel.findById(member.user_id)
          // eslint-disable-next-line no-console
          console.log(`     + ${user?.full_name || user?.email || member.user_id}`)
        }
      }
      // eslint-disable-next-line no-console
      console.log('')
    }

    // eslint-disable-next-line no-console
    console.log('═══════════════════════════════════════════════════')
    // eslint-disable-next-line no-console
    console.log(`📊 TỔNG KẾT:`)
    // eslint-disable-next-line no-console
    console.log(`   - Tổng viewer roles: ${viewerRoles.length}`)
    // eslint-disable-next-line no-console
    console.log(`   - Tổng users có viewer role: ${totalUsersWithViewer}`)
    // eslint-disable-next-line no-console
    console.log('═══════════════════════════════════════════════════\n')

    if (totalUsersWithViewer > 0) {
      // eslint-disable-next-line no-console
      console.log('⚠️  Cảnh báo: Có users đang sử dụng viewer role!')
      // eslint-disable-next-line no-console
      console.log('   Nếu chạy migration, họ sẽ được chuyển sang role "member".\n')
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Lỗi:', error)
    throw error
  } finally {
    await CLOSE_DB()
    // eslint-disable-next-line no-console
    console.log('✅ Hoàn tất kiểm tra.\n')
  }
}

// Chạy script
checkViewerRole()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error('❌ Script thất bại:', error)
    process.exit(1)
  })
