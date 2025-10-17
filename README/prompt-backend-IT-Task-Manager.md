# 🚀 [Yêu cầu tạo Backend cho IT Task Manager]

Tôi muốn bạn đóng vai trò kỹ sư backend và giúp tôi tạo ra **toàn bộ backend** của hệ thống IT Task Manager với các yêu cầu sau:

---

## 🧩 Mục tiêu dự án:
Hệ thống giúp các team IT quản lý công việc, nhiệm vụ, dự án và giao tiếp nội bộ.

## ⚙️ Công nghệ Backend:
- Node.js
- Express.js
- MongoDB (sử dụng Mongoose)
- JWT Authentication
- Socket.io (chat nội bộ)
- Có thể dùng TypeScript nếu muốn
- Thiết kế **folder structure rõ ràng**, gồm các phần:
  - `/controllers`
  - `/models`
  - `/routes`
  - `/services`
  - `/middlewares`
  - `/utils`
  - `/config`
  - `server.js` hoặc `app.js`

---

## 📊 Các Module cần có:

### 1. 🧑‍💼 Quản lý người dùng
- Đăng ký / đăng nhập
- Vai trò (admin, tech lead, developer, tester, etc.)
- Profile cá nhân: tên, email, avatar, bio, ngôn ngữ
- API cập nhật thông tin người dùng

### 2. 📁 Dự án
- CRUD dự án
- Thêm/xóa thành viên
- Phân vai trò từng thành viên trong dự án

### 3. 📋 Nhiệm vụ (task)
- CRUD task
- Trạng thái: Todo → In Progress → Testing → Completed
- Gán task cho user
- Tìm kiếm, lọc task theo dự án, trạng thái, người nhận

### 4. 📅 Lịch công việc
- Trả về task theo ngày/tháng
- Đếm số task tới hạn

### 5. 💬 Chat nội bộ
- Gửi tin nhắn 1-1
- Sử dụng Socket.io cho realtime
- API lấy danh sách đoạn chat

### 6. 🔔 Thông báo
- Gửi thông báo khi được gán task
- Gửi thông báo tin nhắn mới

---

## 📁 Kết quả mong muốn:
1. `README.md` hướng dẫn setup, cấu trúc folder, mô tả hệ thống
2. Các file code backend được tổ chức gọn gàng
3. Mẫu dữ liệu seed
4. Swagger hoặc Postman Collection (nếu có thể)

---

## 📝 Ghi chú thêm:
- Mọi biến môi trường (MongoDB URI, JWT Secret…) cần nằm trong `.env`
- Token JWT lưu trữ thông tin vai trò người dùng
- Mỗi project nên có phân quyền thành viên theo vai trò
- Gợi ý dùng cấu trúc folder dạng “clean architecture”
