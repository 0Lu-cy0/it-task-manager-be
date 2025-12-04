# 🚀 IT Task Manager Backend

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node.js-%3E%3D18.x-brightgreen)

Hệ thống backend quản lý công việc và dự án cho các team IT, được xây dựng với Node.js, Express.js và MongoDB.

## 📋 Tổng quan

IT Task Manager là một hệ thống quản lý dự án và nhiệm vụ toàn diện, hỗ trợ:
- Quản lý dự án và thành viên
- Phân quyền chi tiết theo vai trò
- Quản lý nhiệm vụ với workflow hoàn chỉnh
- Hệ thống mời thành viên
- Dashboard thống kê
- Tìm kiếm toàn cục với Fuse.js (in-memory)
- Hệ thống thông báo
- Chat realtime (chuẩn bị)

## 🛠️ Công nghệ sử dụng

- **Runtime**: Node.js (>=18.x)
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose ODM
- **Search Engine**: Fuse.js (in-memory)
- **Authentication**: JWT (Access Token + Refresh Token)
- **Validation**: Joi
- **Documentation**: Swagger
- **Security**: CORS, Rate Limiting, bcrypt
- **Logging**: Winston
- **Email**: Nodemailer
- **Build Tools**: Babel, ESLint

## 📁 Cấu trúc thư mục

```
src/
├── config/           # Cấu hình hệ thống
│   ├── cors.js       # Cấu hình CORS
│   ├── environment.js # Biến môi trường
│   ├── mongodb.js    # Kết nối MongoDB
│   └── swagger.js    # Cấu hình API docs
├── constants/        # Hằng số và thông báo
│   └── messages.js   # Thông báo hệ thống
├── controllers/      # Xử lý logic nghiệp vụ
│   ├── authController.js
│   ├── dashboardController.js
│   ├── inviteController.js
│   ├── notiController.js
│   ├── projectController.js
│   ├── projectRolesController.js
│   ├── searchController.js
│   ├── taskController.js
│   └── userController.js
├── middlewares/      # Middleware xử lý request
│   ├── authMiddleware.js
│   ├── errorHandlingMiddleware.js
│   ├── inviteMiddleware.js
│   ├── projectMiddleware.js
│   ├── projectRoleMiddleware.js
│   ├── responseWrapper.js
│   ├── rolesMiddleware.js
│   ├── searchMiddleware.js
│   └── taskMiddleware.js
├── models/           # Schema MongoDB
│   ├── authModel.js
│   ├── chatContactModel.js
│   ├── conversationModel.js
│   ├── defaultRolesModel.js
│   ├── enumModel.js
│   ├── inviteModel.js
│   ├── messageModel.js
│   ├── notificationModel.js
│   ├── permissionModel.js
│   ├── projectModel.js
│   ├── projectRolesModel.js
│   ├── refreshTokenModel.js
│   └── taskModel.js
├── repository/       # Tầng truy cập dữ liệu
│   ├── authRepository.js
│   ├── dashboardRepository.js
│   ├── defaultRolesRepository.js
│   ├── inviteRepository.js
│   ├── notiRepository.js
│   ├── projectRepository.js
│   ├── projectRolesRepository.js
│   └── taskRepository.js
├── routes/           # Định tuyến API
│   ├── auth/         # Routes xác thực
│   │   ├── authRoute.js
│   │   └── index.js
│   └── home/         # Routes chính
│       ├── dashboardRoute.js
│       ├── index.js
│       ├── inviteRoute.js
│       ├── notificationRoute.js
│       ├── projectRolesRoute.js
│       ├── projectRoute.js
│       ├── searchRoute.js
│       └── taskRoute.js
├── services/         # Logic nghiệp vụ
│   ├── authService.js
│   ├── dashboardService.js
│   ├── defaultRolesService.js
│   ├── inviteService.js
│   ├── notiService.js
│   ├── projectRolesService.js
│   ├── projectService.js
│   ├── searchService.js
│   ├── taskService.js
│   └── userService.js
├── utils/            # Tiện ích
│   ├── algorithms.js
│   ├── APIError.js
│   ├── apiResponse.js
│   ├── authUtils.js
│   ├── constants.js
│   ├── formater.js
│   ├── getRoleId.js
│   ├── mongooseHelper.js
│   ├── permission.js
│   ├── searchUtils.js
│   ├── sorts.js
│   └── validators.js
├── validations/      # Validation schemas
│   ├── authValidation.js
│   ├── chatContactValidation.js
│   ├── conversationValidation.js
│   ├── defaultRolesValidation.js
│   ├── enumValidation.js
│   ├── inviteValidation.js
│   ├── messageValidation.js
│   ├── notificationValidation.js
│   ├── projectRolesValidation.js
│   ├── projectValidation.js
│   ├── roleValidation.js
│   ├── taskValidation.js
│   └── userValidation.js
└── server.js         # Entry point
```

## 🔐 Hệ thống xác thực

### JWT Authentication
- **Access Token**: Thời hạn ngắn (1 ngày)
- **Refresh Token**: Thời hạn dài (7 ngày), lưu trong database
- **Token Rotation**: Tự động làm mới token khi hết hạn

### Phân quyền
- **4 vai trò mặc định**: Owner, Lead, Member, Viewer
- **Permissions chi tiết**: Mỗi vai trò có quyền hạn cụ thể
- **Free Mode**: Khi được kích hoạt bởi Owner, cho phép tùy chỉnh quyền hạn chi tiết cho từng vai trò trong dự án, vượt ra ngoài các thiết lập mặc định.

## 📊 Các Module chính

*Để xem chi tiết về request body, parameters và response examples, vui lòng tham khảo [API Documentation](#-api-documentation) qua Swagger.*

### 1. Authentication & Authorization
```
POST /auth/register                    # Đăng ký
POST /auth/login                       # Đăng nhập
POST /auth/reset-password/request      # Yêu cầu reset mật khẩu
POST /auth/reset-password/confirm      # Xác nhận reset mật khẩu
GET  /auth/me                          # Thông tin user
PUT  /auth/me                          # Cập nhật profile
PUT  /auth/me/password                 # Đổi mật khẩu
POST /auth/refresh                     # Làm mới token
POST /auth/logout                      # Đăng xuất
```

### 2. Project Management
```
GET    /home/projects                           # Danh sách dự án
POST   /home/projects                           # Tạo dự án mới
GET    /home/projects/{projectId}                # Chi tiết dự án
PUT    /home/projects/{projectId}                # Cập nhật dự án
DELETE /home/projects/{projectId}                # Xóa dự án
DELETE /home/projects/{projectId}/members/{userId} # Xóa thành viên
PUT    /home/projects/{projectId}/roles          # Cập nhật vai trò thành viên
GET    /home/projects/{projectId}/roles          # Lấy danh sách vai trò
PATCH  /home/projects/{projectId}/free-mode     # Bật/tắt Free Mode
```

### 3. Task Management
```
GET    /home/tasks                           # Danh sách task
POST   /home/tasks/{projectId}                # Tạo task mới
GET    /home/tasks/{projectId}/{id}            # Chi tiết task
PUT    /home/tasks/{projectId}/{id}            # Cập nhật task
DELETE /home/tasks/{projectId}/{id}            # Xóa task
POST   /home/tasks/{projectId}/{id}/assign     # Gán task
POST   /home/tasks/{projectId}/{id}/unassign   # Gỡ gán task
PATCH  /home/tasks/{projectId}/{id}/status     # Cập nhật trạng thái
```

### 4. Invite System
```
POST /home/invites/{projectId}/inviteLink  # Tạo link mời
GET  /home/invites/{token}                 # Xử lý link mời
```

### 5. Dashboard
```
GET /home/dashboards/        # Thống kê tổng quan
GET /home/dashboards/recent  # Dự án gần đây
```

### 6. Role & Permission Management
```
POST   /home/project-roles/{projectId}/roles/{roleId}/permissions           # Thêm quyền
DELETE /home/project-roles/{projectId}/roles/{roleId}/permissions/{permId}   # Xóa quyền
GET    /home/project-roles/{projectId}/roles/{roleId}/permissions           # Xem quyền
```

### 7. Search System
```
GET /home/search          # Tìm kiếm toàn cục
GET /home/search/projects # Tìm kiếm dự án
GET /home/search/tasks    # Tìm kiếm task
GET /home/search/users    # Tìm kiếm người dùng
```

### 8. Notification System
```
GET    /home/noti           # Lấy tất cả thông báo
GET    /home/noti/{notiId}   # Chi tiết thông báo
PATCH  /home/noti/{notiId}   # Đánh dấu đã đọc
DELETE /home/noti/{notiId}   # Xóa thông báo
DELETE /home/noti          # Xóa tất cả thông báo
```

## 🗄️ Database Schema

### Các Collection chính:
- **users**: Thông tin người dùng
- **projects**: Dự án và thành viên
- **tasks**: Nhiệm vụ và phân công
- **project_roles**: Vai trò trong dự án
- **permissions**: Quyền hạn hệ thống
- **default_roles**: Vai trò mặc định
- **invites**: Lời mời tham gia
- **refresh_tokens**: Token làm mới
- **notifications**: Thông báo
- **chatcontacts**: Danh bạ chat
- **conversations**: Cuộc trò chuyện
- **messages**: Tin nhắn

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd it-task-manager-backend
```

### 2. Cài đặt dependencies
```bash
yarn install
```

### 3. Cấu hình môi trường
Tạo file `.env` (tham khảo `.env.example`):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/it-task-manager
DATABASE_NAME=it-task-manager

# Server
APP_HOST=localhost
APP_PORT=8181

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_SECRET_KEY_REFRESH=your-refresh-secret-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client
CLIENT_URL=http://localhost:3000

# MeiliSearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your-meili-api-key

# Author
AUTHOR=YourName
```

### 4. Chạy ứng dụng
```bash
# Tải và khởi động MeiliSearch + Development server
yarn run setup

# Chỉ development (cần MeiliSearch đã chạy)
yarn run dev

# Production
yarn run production

# Chỉ tải MeiliSearch
yarn run download-meili

# Chỉ khởi động MeiliSearch
yarn run meili
```

## 🔧 Troubleshooting

### Lỗi `Error: Cannot find module '...'`
Lỗi này xảy ra khi một package cần thiết chưa được cài đặt trong `node_modules`.

**Giải pháp:**
1.  **Xóa và cài đặt lại**: Cách giải quyết phổ biến nhất là xóa thư mục `node_modules` và file `yarn.lock` (hoặc `package-lock.json` nếu dùng npm) rồi chạy lại lệnh cài đặt.
    ```bash
    rm -rf node_modules yarn.lock
    yarn install
    ```
2.  **Cài đặt thủ công**: Nếu bạn biết package nào bị thiếu (ví dụ: `debug` từ log lỗi của bạn), bạn có thể cài đặt nó trực tiếp:
    ```bash
    yarn add debug
    ```

## 📚 API Documentation

Truy cập Swagger UI tại: `http://localhost:8181/api-docs`

## 🔒 Bảo mật

- **Rate Limiting**: Giới hạn request theo IP
- **CORS**: Cấu hình domain được phép truy cập
- **Input Validation**: Joi validation cho tất cả input
- **Password Hashing**: bcrypt với salt rounds = 10
- **JWT Security**: Access token ngắn hạn + Refresh token rotation
- **Error Handling**: Không expose sensitive information

## 🏗️ Kiến trúc

### Clean Architecture
- **Controllers**: Xử lý HTTP requests/responses
- **Services**: Logic nghiệp vụ
- **Repository**: Truy cập dữ liệu
- **Models**: Schema và validation
- **Middlewares**: Xử lý cross-cutting concerns

### Design Patterns
- **Repository Pattern**: Tách biệt logic truy cập dữ liệu
- **Service Layer**: Tập trung logic nghiệp vụ
- **Middleware Pattern**: Xử lý request pipeline
- **Error Handling**: Centralized error handling

## 🔄 Workflow

### Task Workflow
```
Todo → In Progress → Testing → Completed
```

### Project Status
```
Planning → In Progress → Testing → Completed
```

### Permission System
- **Owner**: Toàn quyền, có thể bật Free Mode
- **Lead**: Quản lý thành viên và tasks
- **Member**: Tạo và chỉnh sửa tasks
- **Viewer**: Chỉ xem

## 🚧 Tính năng sắp tới

- [ ] **Chat Real-time**: Tích hợp chat trực tiếp giữa các thành viên dự án sử dụng Socket.io (models đã sẵn sàng).
- [ ] File upload và attachment
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Mobile API optimization
- [ ] Webhook integrations
- [ ] Advanced search filters
- [ ] Task templates
- [ ] Time tracking

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

---

**Phát triển bởi**: Cat2004  
**Phiên bản**: 1.0.0  
**Node.js**: >=18.x  
**Cập nhật**: 2024