# 🚀 IT Task Manager Backend

Hệ thống backend quản lý công việc và dự án cho các team IT, được xây dựng với Node.js, Express.js và MongoDB.

## 📋 Tổng quan

IT Task Manager là một hệ thống quản lý dự án và nhiệm vụ toàn diện, hỗ trợ:
- Quản lý dự án và thành viên
- Phân quyền chi tiết theo vai trò
- Quản lý nhiệm vụ với workflow hoàn chỉnh
- Hệ thống mời thành viên
- Dashboard thống kê
- Chat realtime (chuẩn bị)

## 🛠️ Công nghệ sử dụng

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT (Access Token + Refresh Token)
- **Validation**: Joi
- **Documentation**: Swagger
- **Security**: CORS, Rate Limiting, bcrypt
- **Logging**: Winston
- **Email**: Nodemailer

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
│   ├── projectController.js
│   ├── projectRolesController.js
│   └── taskController.js
├── middlewares/      # Middleware xử lý request
│   ├── authMiddleware.js
│   ├── errorHandlingMiddleware.js
│   ├── inviteMiddleware.js
│   ├── projectMiddleware.js
│   ├── projectRoleMiddleware.js
│   ├── rolesMiddleware.js
│   └── taskMiddleware.js
├── models/           # Schema MongoDB
│   ├── authModel.js
│   ├── projectModel.js
│   ├── projectRolesModel.js
│   ├── taskModel.js
│   ├── inviteModel.js
│   ├── permissionModel.js
│   ├── defaultRolesModel.js
│   ├── refreshTokenModel.js
│   └── notificationModel.js
├── repository/       # Tầng truy cập dữ liệu
│   ├── authRepository.js
│   ├── dashboardRepository.js
│   ├── inviteRepository.js
│   ├── projectRepository.js
│   ├── projectRolesRepository.js
│   └── taskRepository.js
├── routes/           # Định tuyến API
│   ├── auth/         # Routes xác thực
│   └── home/         # Routes chính
├── services/         # Logic nghiệp vụ
│   ├── authService.js
│   ├── dashboardService.js
│   ├── inviteService.js
│   ├── projectService.js
│   ├── projectRolesService.js
│   └── taskService.js
├── utils/            # Tiện ích
│   ├── ApiError.js
│   ├── authUtils.js
│   ├── constants.js
│   ├── formater.js
│   ├── getRoleId.js
│   ├── permission.js
│   └── validators.js
├── validations/      # Validation schemas
│   ├── authValidation.js
│   ├── projectValidation.js
│   ├── taskValidation.js
│   └── inviteValidation.js
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
- **Free Mode**: Owner có thể tùy chỉnh quyền hạn không giới hạn

## 📊 Các Module chính

### 1. Authentication & Authorization
```
POST /auth/register     # Đăng ký
POST /auth/login        # Đăng nhập
POST /auth/refresh      # Làm mới token
POST /auth/logout       # Đăng xuất
GET  /auth/me          # Thông tin user
PUT  /auth/me          # Cập nhật profile
```

### 2. Project Management
```
GET    /home/projects           # Danh sách dự án
POST   /home/projects           # Tạo dự án mới
GET    /home/projects/:id       # Chi tiết dự án
PUT    /home/projects/:id       # Cập nhật dự án
DELETE /home/projects/:id       # Xóa dự án
PUT    /home/projects/:id/roles # Cập nhật vai trò thành viên
```

### 3. Task Management
```
GET    /home/tasks              # Danh sách task
POST   /home/tasks/:projectId   # Tạo task mới
GET    /home/tasks/:projectId/:id    # Chi tiết task
PUT    /home/tasks/:projectId/:id    # Cập nhật task
DELETE /home/tasks/:projectId/:id    # Xóa task
POST   /home/tasks/:projectId/:id/assign   # Gán task
PATCH  /home/tasks/:projectId/:id/status   # Cập nhật trạng thái
```

### 4. Invite System
```
POST /home/invites/:projectId/inviteLink  # Tạo link mời
GET  /home/invites/:token                 # Xử lý link mời
```

### 5. Dashboard
```
GET /home/dashboards/        # Thống kê tổng quan
GET /home/dashboards/recent  # Dự án gần đây
```

### 6. Role & Permission Management
```
POST   /home/project-roles/:projectId/roles/:roleId/permissions           # Thêm quyền
DELETE /home/project-roles/:projectId/roles/:roleId/permissions/:permId   # Xóa quyền
GET    /home/project-roles/:projectId/roles/:roleId/permissions           # Xem quyền
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

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd it-task-manager-backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/it-task-manager
DATABASE_NAME=it-task-manager

# Server
APP_HOST=localhost
APP_PORT=8181
BUILD_MODE=dev

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_SECRET_KEY_REFRESH=your-refresh-secret-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client
CLIENT_URL=http://localhost:3000

# Author
AUTHOR=YourName
```

### 4. Chạy ứng dụng
```bash
# Development
npm run dev

# Production
npm start
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

- [ ] Real-time chat với Socket.io
- [ ] File upload và attachment
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Mobile API optimization
- [ ] Webhook integrations

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

---

**Phát triển bởi**: IT Task Manager Team  
**Phiên bản**: 1.0.0  
**Cập nhật**: 2024