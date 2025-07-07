import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

//Tạo 1 đối tượng itTaskDatabaseInstance ban đầu là null(vì chưa connect)
let itTaskDatabaseInstance = null

//Khỏi tạo một đối tựng mongoCLientInstance để connect tới mongodb
const mongoCLientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

//Kết nối tới db
export const CONNECT_DB = async () => {
  //Gọi kết nối tới mongo atlas với URI đã khai báo trong thân của mongoCLientInstance
  await mongoCLientInstance.connect()

  //Kết nối thành công thì lấy ra db theo tên và gán ngược lại biến itTaskDatabaseInstance đã được khai báo bằng null ở bên trên
  itTaskDatabaseInstance = mongoCLientInstance.db(env.DATABASE_NAME)

  return itTaskDatabaseInstance
}
// Function GET_DB (không async) này có nhiệm vụ export ra cái itTaskDatabaseInstance sau khi đã connect thành
// công tới MongoDB đề chúng ta sử dụng ở nhiều nơi khác nhau trong code.
// Lưu ý phải đảm bảo chỉ luôn gọi cái GET_DB này sau khi đã kết nỗi thành công tới MongoDB
export const GET_DB = () => {
  if (!itTaskDatabaseInstance) throw new Error('Hãy kết nối tới database trước!')
  return itTaskDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoCLientInstance.close()
}
