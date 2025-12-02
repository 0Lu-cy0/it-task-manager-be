# System Functional Design

Tài liệu này tóm tắt các khối chức năng chính của backend IT Task Manager (`src/routes`, `src/controllers`, `src/services`) và mô tả chúng bằng các biểu đồ Use Case & Sequence PlantUML để hỗ trợ quá trình phân tích thiết kế hệ thống.

---

## 1. Authentication & Profile Management
**Scope:** Đăng ký/đăng nhập, làm mới/thu hồi phiên JWT, cập nhật hồ sơ và quy trình reset mật khẩu (xem `src/routes/auth/authRoute.js`).

**Key Endpoints:**
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/token/refresh`
- `GET /auth/me`, `PUT /auth/me`, `PUT /auth/me/password`
- `POST /auth/password/reset-requests`, `POST /auth/password/reset-confirmations`

### Use Case Diagram
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor User
rectangle "Authentication & Profile" {
  usecase "Đăng ký" as UC_Register
  usecase "Đăng nhập" as UC_Login
  usecase "Làm mới token" as UC_Refresh
  usecase "Đăng xuất" as UC_Logout
  usecase "Lấy thông tin cá nhân" as UC_GetProfile
  usecase "Cập nhật hồ sơ" as UC_UpdateProfile
  usecase "Đổi mật khẩu" as UC_ChangePassword
  usecase "Yêu cầu reset mật khẩu" as UC_ResetRequest
  usecase "Xác nhận reset mật khẩu" as UC_ResetConfirm
  usecase "Kiểm tra thông tin đăng nhập" as UC_VerifyCred
  usecase "Xác thực phiên (JWT)" as UC_JWTGuard
  usecase "Xác thực token reset" as UC_ResetToken
}
User --> UC_Register
User --> UC_Login
User --> UC_Refresh
User --> UC_Logout
User --> UC_GetProfile
User --> UC_UpdateProfile
User --> UC_ChangePassword
User --> UC_ResetRequest
User --> UC_ResetConfirm
UC_Login ..> UC_VerifyCred : <<include>>
UC_ChangePassword ..> UC_VerifyCred : <<include>>
UC_Logout ..> UC_JWTGuard : <<include>>
UC_GetProfile ..> UC_JWTGuard : <<include>>
UC_UpdateProfile ..> UC_JWTGuard : <<include>>
UC_ChangePassword ..> UC_JWTGuard : <<include>>
UC_ResetConfirm ..> UC_ResetToken : <<include>>
@enduml
```

### Sequence Diagram – User Login
```plantuml
@startuml
actor User
participant "Auth API\nPOST /auth/login" as API
participant "authController" as Controller
participant "authService" as Service
participant "authRepository" as Repo
database "MongoDB" as DB

User -> API : gửi email/password
API -> Controller : login(req)
Controller -> Service : login(data)
Service -> Repo : findUserByEmail(email)
Repo -> DB : query users
DB --> Repo : user document
Service -> Controller : throw nếu sai mật khẩu
Service -> Repo : saveRefreshToken(userId, refreshToken)
Repo -> DB : insert refresh token
Service --> Controller : {accessToken, refreshToken}
Controller --> API : HTTP 200 JSON
API --> User : token + thông tin user
@enduml
```

---

## 2. Project & Member Management
**Scope:** CRUD dự án, xem danh sách/chi tiết, quản lý thành viên, vai trò và thiết lập Free Mode (`src/routes/home/projectRoute.js`).

**Key Endpoints:**
- `POST /home/projects`, `GET /home/projects`, `GET /home/projects/{id}`
- `PUT /home/projects/{id}`, `DELETE /home/projects/{id}`
- `GET /home/projects/{id}/members`, `DELETE /home/projects/{id}/members/{userId}`
- `PUT /home/projects/{id}/members/roles`, `PATCH /home/projects/{id}/settings`
- `GET /home/projects/{id}/roles`

### Use Case Diagram
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor User
actor "Project Owner" as Owner
rectangle "Project & Member Management" {
  usecase "Tạo project" as UC_AddProject
  usecase "Xem danh sách project" as UC_ListProjects
  usecase "Xem chi tiết project" as UC_ViewProject
  usecase "Cập nhật project" as UC_EditProject
  usecase "Xóa project" as UC_DeleteProject
  usecase "Xem thành viên" as UC_ViewMembers
  usecase "Xóa thành viên" as UC_RemoveMember
  usecase "Cập nhật vai trò thành viên" as UC_UpdateMemberRole
  usecase "Bật/Tắt Free Mode" as UC_ToggleFreeMode
  usecase "Lấy danh sách vai trò" as UC_ViewRoles
  usecase "Kiểm tra quyền dự án" as UC_ProjectPermission
}
User --> UC_ListProjects
User --> UC_ViewProject
Owner --> UC_AddProject
Owner --> UC_EditProject
Owner --> UC_DeleteProject
Owner --> UC_ViewMembers
Owner --> UC_RemoveMember
Owner --> UC_UpdateMemberRole
Owner --> UC_ToggleFreeMode
Owner --> UC_ViewRoles
UC_AddProject ..> UC_ProjectPermission : <<include>>
UC_EditProject ..> UC_ProjectPermission : <<include>>
UC_DeleteProject ..> UC_ProjectPermission : <<include>>
UC_ViewMembers ..> UC_ProjectPermission : <<include>>
UC_RemoveMember ..> UC_ProjectPermission : <<include>>
UC_UpdateMemberRole ..> UC_ProjectPermission : <<include>>
UC_ToggleFreeMode ..> UC_ProjectPermission : <<include>>
@enduml
```

### Sequence Diagram – Update Member Role
```plantuml
@startuml
actor "Project Owner" as Owner
participant "Projects API\nPUT /home/projects/{id}/members/roles" as API
participant "projectMiddleware" as Middleware
participant "projectController" as Controller
participant "projectService" as Service
participant "projectRepository" as ProjectRepo
participant "projectRolesRepository" as RoleRepo
database "MongoDB" as DB

Owner -> API : memberId, newRoleId
autonumber
API -> Middleware : checkProjectPermission('change_member_role')
Middleware --> API : authorized
API -> Controller : updateMemberRole(req)
Controller -> Service : updateMemberRole(projectId, payload)
Service -> ProjectRepo : findById(projectId)
ProjectRepo -> DB : query projects
DB --> ProjectRepo : project doc
Service -> RoleRepo : findRoleById(newRoleId)
RoleRepo -> DB : query project_roles
DB --> RoleRepo : role doc
Service -> ProjectRepo : updateMemberRole(projectId, memberId, roleId)
ProjectRepo -> DB : update members array
DB --> ProjectRepo : success
Service --> Controller : updated member snapshot
Controller --> API : HTTP 200
API --> Owner : JSON response
@enduml
```

---

## 3. Column & Task Board
**Scope:** Quản lý cột và nhiệm vụ kiểu Kanban (xem `src/routes/home/columnRouter.js` và `src/routes/home/taskRoute.js`).

**Key Endpoints:**
- Columns: `GET /home/columns/projects/{projectId}`, `POST /home/columns/projects/{projectId}`, `GET /home/columns/{id}`, `PUT /home/columns/{id}`, `DELETE /home/columns/{id}`, `PATCH /home/columns/cards/move`
- Tasks: `GET /home/tasks`, `POST /home/tasks/projects/{projectId}`, `GET /home/tasks/projects/{projectId}/{taskId}`, `PUT /home/tasks/projects/{projectId}/{taskId}`, `DELETE ...`, `POST/DELETE /assignments`, `PATCH /status`

### Use Case Diagram
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor "Project Member" as Member
rectangle "Kanban Board" {
  usecase "Xem columns" as UC_ListColumns
  usecase "Thêm column" as UC_AddColumn
  usecase "Sửa column" as UC_EditColumn
  usecase "Xóa column" as UC_DeleteColumn
  usecase "Di chuyển task giữa columns" as UC_MoveTask
  usecase "Xem tasks" as UC_ListTasks
  usecase "Thêm task" as UC_AddTask
  usecase "Sửa task" as UC_EditTask
  usecase "Xóa task" as UC_DeleteTask
  usecase "Gán/Gỡ thành viên" as UC_AssignTask
  usecase "Cập nhật trạng thái task" as UC_UpdateTaskStatus
  usecase "Kiểm tra quyền dự án" as UC_ProjectPermission
}
Member --> UC_ListColumns
Member --> UC_AddColumn
Member --> UC_EditColumn
Member --> UC_DeleteColumn
Member --> UC_MoveTask
Member --> UC_ListTasks
Member --> UC_AddTask
Member --> UC_EditTask
Member --> UC_DeleteTask
Member --> UC_AssignTask
Member --> UC_UpdateTaskStatus
UC_AddColumn ..> UC_ProjectPermission : <<include>>
UC_EditColumn ..> UC_ProjectPermission : <<include>>
UC_DeleteColumn ..> UC_ProjectPermission : <<include>>
UC_MoveTask ..> UC_ProjectPermission : <<include>>
UC_AddTask ..> UC_ProjectPermission : <<include>>
UC_EditTask ..> UC_ProjectPermission : <<include>>
UC_DeleteTask ..> UC_ProjectPermission : <<include>>
UC_AssignTask ..> UC_ProjectPermission : <<include>>
UC_UpdateTaskStatus ..> UC_ProjectPermission : <<include>>
@enduml
```

### Sequence Diagram – Move Task Between Columns
```plantuml
@startuml
actor "Project Member" as Member
participant "Columns API\nPATCH /home/columns/cards/move" as API
participant "columnController" as Controller
participant "columnService" as Service
participant "taskRepository" as TaskRepo
participant "columnRepository" as ColumnRepo
database "MongoDB" as DB

Member -> API : cardId, fromColumnId, toColumnId, position
API -> Controller : moveCard(req)
Controller -> Service : moveCard(cardId, from, to, position)
Service -> TaskRepo : updateById(cardId, { columnId: to })
TaskRepo -> DB : update task
Service -> ColumnRepo : removeCardFromColumn(from, cardId)
ColumnRepo -> DB : $pull cardOrderIds
Service -> ColumnRepo : addCardToColumn(to, cardId, position)
ColumnRepo -> DB : $push cardOrderIds
Service --> Controller : result message
Controller --> API : HTTP 200 "Card moved"
API --> Member : success response
@enduml
```

---

## 4. Invite & Access Control
**Scope:** Lời mời tham gia dự án, link cố định, thao tác chấp nhận/từ chối và yêu cầu truy cập project riêng tư (`src/routes/home/inviteRoute.js`, `src/routes/home/accessRequestRoute.js`).

**Key Endpoints:**
- Invites: `GET /home/invites/me`, `GET /home/invites/projects/{projectId}/permanent-link`, `GET /home/invites/projects/{projectId}/emails`, `POST /home/invites/projects/{projectId}`, `PATCH /home/invites/{inviteId}/accept|reject`, `DELETE /home/invites/{inviteId}`, `GET /home/invites/token/{token}`
- Access Requests: `GET /home/access-requests/me`, `POST /home/access-requests/projects/{projectId}`, `GET /home/access-requests/projects/{projectId}`, `PATCH /home/access-requests/{requestId}/accept|reject`

### Use Case Diagram
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor "Project Owner" as Owner
actor "External User" as Guest
rectangle "Invites & Access" {
  usecase "Tạo link mời" as UC_CreateLink
  usecase "Gửi lời mời email" as UC_SendInvite
  usecase "Xem lời mời của tôi" as UC_ViewInvites
  usecase "Chấp nhận lời mời" as UC_AcceptInvite
  usecase "Từ chối lời mời" as UC_RejectInvite
  usecase "Hủy lời mời" as UC_CancelInvite
  usecase "Tham gia qua link" as UC_JoinByLink
  usecase "Gửi yêu cầu truy cập" as UC_RequestAccess
  usecase "Xem yêu cầu của tôi" as UC_ViewMyRequests
  usecase "Duyệt/Từ chối yêu cầu" as UC_ModerateAccess
  usecase "Kiểm tra quyền add_member" as UC_AddMemberPermission
}
Owner --> UC_CreateLink
Owner --> UC_SendInvite
Owner --> UC_CancelInvite
Owner --> UC_ModerateAccess
Owner --> UC_ViewInvites
Guest --> UC_ViewInvites
Guest --> UC_AcceptInvite
Guest --> UC_RejectInvite
Guest --> UC_JoinByLink
Guest --> UC_RequestAccess
Guest --> UC_ViewMyRequests
UC_CreateLink ..> UC_AddMemberPermission : <<include>>
UC_SendInvite ..> UC_AddMemberPermission : <<include>>
UC_CancelInvite ..> UC_AddMemberPermission : <<include>>
UC_ModerateAccess ..> UC_AddMemberPermission : <<include>>
@enduml
```

### Sequence Diagram – Send Invite via Email
```plantuml
@startuml
actor "Project Owner" as Owner
participant "Invites API\nPOST /home/invites/{projectId}" as API
participant "projectMiddleware" as ProjectMW
participant "inviteController" as Controller
participant "inviteService" as Service
participant "inviteRepository" as InviteRepo
participant "emailService" as Mailer
database "MongoDB" as DB

Owner -> API : emails[], roleId
API -> ProjectMW : checkProjectPermission('add_member')
ProjectMW --> API : authorized
API -> Controller : sendInviteByEmail(req)
Controller -> Service : sendInviteByEmail(projectId, userId, payload)
Service -> InviteRepo : create invites per email
InviteRepo -> DB : insert invite docs
Service -> Mailer : send email with token/link
Mailer --> Service : accepted
Service --> Controller : invite summary
Controller --> API : HTTP 201
API --> Owner : {invites, permanentLink}
@enduml
```

---

## 5. Notification System
**Scope:** Lấy danh sách thông báo, xem chi tiết, đánh dấu đã đọc và xóa (`src/routes/home/notificationRoute.js`).

**Key Endpoints:**
- `GET /home/noti`, `GET /home/noti/{id}`
- `PATCH /home/noti/{id}` (mark as read)
- `DELETE /home/noti/{id}`, `DELETE /home/noti` (xóa hàng loạt)

### Use Case Diagram
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor User
rectangle "Notification Center" {
  usecase "Xem thông báo" as UC_ViewNotifications
  usecase "Xem chi tiết thông báo" as UC_ViewNotificationDetail
  usecase "Đánh dấu đã đọc" as UC_MarkAsRead
  usecase "Xóa thông báo" as UC_DeleteNotification
  usecase "Xóa tất cả thông báo" as UC_DeleteAll
  usecase "Xác thực phiên (JWT)" as UC_JWTGuard
}
User --> UC_ViewNotifications
User --> UC_ViewNotificationDetail
User --> UC_MarkAsRead
User --> UC_DeleteNotification
User --> UC_DeleteAll
UC_ViewNotifications ..> UC_JWTGuard : <<include>>
UC_ViewNotificationDetail ..> UC_JWTGuard : <<include>>
UC_MarkAsRead ..> UC_JWTGuard : <<include>>
UC_DeleteNotification ..> UC_JWTGuard : <<include>>
UC_DeleteAll ..> UC_JWTGuard : <<include>>
@enduml
```

### Sequence Diagram – Mark Notification as Read
```plantuml
@startuml
actor User
participant "Notification API\nPATCH /home/noti/{id}" as API
participant "notiController" as Controller
participant "notiService" as Service
participant "notiRepository" as Repo
database "MongoDB" as DB

User -> API : PATCH body {status: read}
API -> Controller : markAsRead(req)
Controller -> Service : markAsRead(userId, notiId)
Service -> Repo : updateStatus(userId, notiId, read)
Repo -> DB : update notification
DB --> Repo : success
Repo --> Service : updated doc
Service --> Controller : result
Controller --> API : HTTP 200
API --> User : {message: "Marked as read"}
@enduml
```

---

## 6. Search & Dashboard Insights
**Scope:** Dashboard thống kê, danh sách project gần đây và tìm kiếm toàn cục bằng MeiliSearch (`src/routes/home/dashboardRoute.js`, `src/routes/home/searchRoute.js`).

**Key Endpoints:**
- Dashboard: `GET /home/dashboards`, `GET /home/dashboards/projects/recent`
- Search: `GET /home/search`, `GET /home/search/projects`, `GET /home/search/tasks`, `GET /home/search/users`

### Use Case Diagram
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor User
rectangle "Insights & Search" {
  usecase "Xem dashboard" as UC_ViewDashboard
  usecase "Xem project gần đây" as UC_ViewRecentProjects
  usecase "Tìm kiếm tổng quát" as UC_GlobalSearch
  usecase "Tìm kiếm project" as UC_SearchProjects
  usecase "Tìm kiếm task" as UC_SearchTasks
  usecase "Tìm kiếm user" as UC_SearchUsers
  usecase "Xác thực phiên (JWT)" as UC_JWTGuard
}
User --> UC_ViewDashboard
User --> UC_ViewRecentProjects
User --> UC_GlobalSearch
User --> UC_SearchProjects
User --> UC_SearchTasks
User --> UC_SearchUsers
UC_ViewDashboard ..> UC_JWTGuard : <<include>>
UC_ViewRecentProjects ..> UC_JWTGuard : <<include>>
UC_GlobalSearch ..> UC_JWTGuard : <<include>>
UC_SearchProjects ..> UC_JWTGuard : <<include>>
UC_SearchTasks ..> UC_JWTGuard : <<include>>
UC_SearchUsers ..> UC_JWTGuard : <<include>>
@enduml
```

### Sequence Diagram – Global Search
```plantuml
@startuml
actor User
participant "Search API\nGET /home/search?q=..." as API
participant "searchController" as Controller
participant "searchService" as Service
participant "MeiliSearch client" as Meili
participant "MongoDB fallback" as DB

User -> API : q = keyword
API -> Controller : globalSearch(req)
Controller -> Service : globalSearch(keyword, filters)
Service -> Meili : multiIndexSearch(keyword)
Meili --> Service : hits (projects, tasks, users)
Service -> DB : fetch missing docs (optional)
DB --> Service : hydrated data
Service --> Controller : aggregated result
Controller --> API : HTTP 200 JSON
API --> User : search results
@enduml
```

---

*PlantUML có thể được render trực tiếp thông qua bất kỳ PlantUML server nào hoặc VS Code PlantUML extension để kiểm chứng luồng hoạt động.*
