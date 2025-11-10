import { CONNECT_DB, CLOSE_DB } from '../src/config/mongodb.js' // Thay bằng đường dẫn thực tế
import { projectModel } from '../src/models/projectModel.js' // Thay bằng đường dẫn thực tế
import seedData from './seedData.js'

// Import các model khác
// Giả sử bạn đã định nghĩa các model cho các collection khác
import { authModel } from '../src/models/authModel.js' // Cần tạo model này
import { userModel } from '../src/models/userModel.js'
import { roleModel } from '../src/models/roleModel.js'
import { taskModel } from '../src/models/taskModel.js'
import { messageModel } from '../src/models/messageModel.js'
import { conversationModel } from '../src/models/conversationModel.js'
import { chatContactModel } from '../src/models/chatContactModel.js'
import { notificationModel } from '../src/models/notificationModel.js'
import { enumModel } from '../src/models/enumModel.js'
import { ColumnModel } from '../src/models/columnModal.js' // Thay bằng đường dẫn thực tế

async function seedDatabase() {
  try {
    await CONNECT_DB()

    console.log('✅ Bắt đầu xóa dữ liệu cũ...')
    console.log('✅ Kiểm tra model:', userModel) // sẽ là undefined nếu import sai
    console.log('✅ Kiểm tra model:', projectModel)
    console.log('✅ Kiểm tra model:', roleModel)
    console.log('✅ Kiểm tra model:', taskModel)
    console.log('✅ Kiểm tra model:', messageModel)
    console.log('✅ Kiểm tra model:', conversationModel)
    console.log('✅ Kiểm tra model:', chatContactModel)
    console.log('✅ Kiểm tra model:', notificationModel)
    console.log('✅ Kiểm tra model:', enumModel)
    console.log('✅ Kiểm tra model:', authModel)
    console.log('✅ Kiểm tra model:', userModel)
    console.log('✅ Kiểm tra model:', ColumnModel)

    // Xóa dữ liệu cũ trong tất cả các collection
    await Promise.all([
      authModel.deleteMany({}),
      userModel.deleteMany({}),
      roleModel.deleteMany({}),
      projectModel.deleteMany({}),
      taskModel.deleteMany({}),
      messageModel.deleteMany({}),
      conversationModel.deleteMany({}),
      chatContactModel.deleteMany({}),
      notificationModel.deleteMany({}),
      enumModel.deleteMany({}),
    ])
    console.log('✅ Đã xóa dữ liệu cũ')

    // Chèn dữ liệu mới
    console.log('✅ Bắt đầu seed dữ liệu mới...')
    await Promise.all([
      authModel.insertMany(seedData.auths),
      userModel.insertMany(seedData.users),
      roleModel.insertMany(seedData.roles),
      projectModel.insertMany(seedData.projects),
      taskModel.insertMany(seedData.tasks),
      messageModel.insertMany(seedData.messages),
      conversationModel.insertMany(seedData.conversations),
      chatContactModel.insertMany(seedData.chatcontacts),
      notificationModel.insertMany(seedData.notifications),
      enumModel.insertMany(seedData.enums),
    ])
    console.log('✅ Seed dữ liệu thành công')
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error)
  } finally {
    await CLOSE_DB()
  }
}

seedDatabase().catch(console.error)
