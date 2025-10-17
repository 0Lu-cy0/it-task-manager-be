/**
 * Định nghĩa riêng một Class ApiError kế thừa class Error sẵn (điều này cần thiết và là Best Practice vì class Error nó là class built-in sẵn)
 */
// Import StatusCodes from http-status-codes package
import { StatusCodes } from 'http-status-codes'

class ApiError extends Error {
  constructor(statusCode, message) {
    // Gọi tới hàm khởi tạo của class Error (class cha) để còn dùng this (kiến thức OOP lập trình hướng đối tượng căn bản)
    // Thằng cha (Error) có property message rồi nên gọi nó luôn trong super cho gọn
    super(message)

    // Tên của cái custom Error này, nếu không set thì mặc định nó sẽ kế thừa là "Error"
    this.name = 'CatError'

    // Gán thêm http status code của chúng ta ở đây
    this.statusCode = statusCode

    // Ghi lại Stack Trace (dấu vết ngăn xếp) để thuận tiện cho việc debug
    Error.captureStackTrace(this, this.constructor)
  }
}

// Lớp lỗi cho các trường hợp không được phép (401)
class UnauthorizedError extends ApiError {
  constructor(message) {
    super(StatusCodes.UNAUTHORIZED, message)
  }
}

// Lớp lỗi cho các trường hợp xung đột (409)
class ConflictError extends ApiError {
  constructor(message) {
    super(StatusCodes.CONFLICT, message)
  }
}

export { ApiError, UnauthorizedError, ConflictError }

export default ApiError
