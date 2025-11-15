import mongoose from 'mongoose'
import { CONNECT_DB, CLOSE_DB } from '../config/mongodb.js'
import { projectModel } from '../models/projectModel.js'
import { projectRolesModel } from '../models/projectRolesModel.js'

/**
 * Migration Script: Remove "viewer" role from database
 *
 * Mục đích:
 * 1. Chuyển tất cả user có role "viewer" sang role "member"
 * 2. Xóa tất cả role definition có name = "viewer" khỏi project_roles collection
 *
 * Cách chạy:
 * node --experimental-specifier-resolution=node src/scripts/migrate-remove-viewer-role.js
 */

async function migrateRemoveViewerRole() {
  console.log('🚀 Starting migration: Remove viewer role...\n')

  await CONNECT_DB()

  const session = await mongoose.startSession()

  try {
    await session.withTransaction(async () => {
      // ==================== BƯỚC 1: Thống kê trước khi migrate ====================
      console.log('📊 Thống kê trước khi migrate:')

      const viewerRoles = await projectRolesModel
        .find({
          name: 'viewer',
          _destroy: false,
        })
        .session(session)

      console.log(`   - Tổng số viewer roles: ${viewerRoles.length}`)

      let totalUsersWithViewerRole = 0
      const projectsAffected = []
      const orphanedRoles = []

      for (const viewerRole of viewerRoles) {
        const project = await projectModel.findById(viewerRole.project_id).session(session)
        if (!project) {
          orphanedRoles.push(viewerRole)
          continue
        }

        const usersWithViewer = project.members.filter(
          member => member.project_role_id.toString() === viewerRole._id.toString()
        )

        if (usersWithViewer.length > 0) {
          totalUsersWithViewerRole += usersWithViewer.length
          projectsAffected.push({
            projectId: project._id,
            projectName: project.name,
            usersCount: usersWithViewer.length,
            viewerRoleId: viewerRole._id,
          })
        }
      }

      console.log(`   - Tổng số users có role viewer: ${totalUsersWithViewerRole}`)
      console.log(`   - Số projects bị ảnh hưởng: ${projectsAffected.length}`)
      console.log(`   - Số orphaned viewer roles: ${orphanedRoles.length}\n`)

      if (orphanedRoles.length > 0) {
        console.log('⚠️  Danh sách orphaned viewer roles (sẽ bị xóa):')
        orphanedRoles.forEach((role, index) => {
          console.log(
            `   ${index + 1}. Role ID: ${role._id} (project_id: ${role.project_id} - project không tồn tại)`
          )
        })
        console.log('')
      }

      if (projectsAffected.length === 0) {
        console.log('✅ Không có user nào có role viewer. Chỉ cần xóa role definitions.')
      } else {
        console.log('📋 Chi tiết projects bị ảnh hưởng:')
        projectsAffected.forEach((p, index) => {
          console.log(`   ${index + 1}. ${p.projectName} (${p.projectId}): ${p.usersCount} users`)
        })
        console.log('')
      }

      // ==================== BƯỚC 2: Migrate users từ viewer sang member ====================
      console.log('🔄 Bắt đầu migrate users từ viewer sang member...\n')

      let totalMigrated = 0

      for (const affectedProject of projectsAffected) {
        const project = await projectModel.findById(affectedProject.projectId).session(session)
        if (!project) {
          console.log(`   ⚠️  Không tìm thấy project ${affectedProject.projectId}`)
          continue
        }

        // Tìm member role của project này
        const memberRole = await projectRolesModel
          .findOne({
            project_id: project._id,
            name: 'member',
            _destroy: false,
          })
          .session(session)

        if (!memberRole) {
          console.log(`   ⚠️  Project "${project.name}" không có member role. Bỏ qua.`)
          continue
        }

        // Cập nhật tất cả members có viewer role sang member role
        let migratedCount = 0
        project.members = project.members.map(member => {
          if (member.project_role_id.toString() === affectedProject.viewerRoleId.toString()) {
            migratedCount++
            return {
              ...member,
              user_id: member.user_id,
              project_role_id: memberRole._id,
              joined_at: member.joined_at,
            }
          }
          return member
        })

        await project.save({ session })

        totalMigrated += migratedCount
        console.log(`   ✅ Project "${project.name}": Đã migrate ${migratedCount} users`)
      }

      console.log(`\n✅ Tổng cộng đã migrate ${totalMigrated} users từ viewer sang member\n`)

      // ==================== BƯỚC 3: Xóa tất cả viewer role definitions ====================
      console.log('🗑️  Bắt đầu xóa viewer role definitions...\n')

      const deleteResult = await projectRolesModel
        .deleteMany({
          name: 'viewer',
        })
        .session(session)

      console.log(`   ✅ Đã xóa ${deleteResult.deletedCount} viewer role definitions\n`)

      // ==================== BƯỚC 4: Thống kê sau khi migrate ====================
      console.log('📊 Thống kê sau khi migrate:')

      const remainingViewerRoles = await projectRolesModel
        .countDocuments({
          name: 'viewer',
        })
        .session(session)

      console.log(`   - Số viewer roles còn lại: ${remainingViewerRoles}`)

      // Kiểm tra xem còn user nào có viewer role không
      let remainingUsersWithViewer = 0
      const allProjects = await projectModel.find({}).session(session)

      for (const project of allProjects) {
        for (const member of project.members) {
          const role = await projectRolesModel.findById(member.project_role_id).session(session)
          if (role && role.name === 'viewer') {
            remainingUsersWithViewer++
          }
        }
      }

      console.log(`   - Số users còn có role viewer: ${remainingUsersWithViewer}`)

      if (remainingViewerRoles === 0 && remainingUsersWithViewer === 0) {
        console.log('\n🎉 Migration thành công! Đã xóa hoàn toàn viewer role khỏi hệ thống.')
      } else {
        console.log('\n⚠️  Migration hoàn tất nhưng vẫn còn một số viewer role. Vui lòng kiểm tra.')
      }
    })
  } catch (error) {
    console.error('\n❌ Migration thất bại:', error)
    throw error
  } finally {
    await session.endSession()
    await CLOSE_DB()
    console.log('\n📴 Đã đóng kết nối database.')
  }
}

// Chạy migration
migrateRemoveViewerRole()
  .then(() => {
    console.log('\n✅ Script hoàn tất.')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Script thất bại:', error)
    process.exit(1)
  })
