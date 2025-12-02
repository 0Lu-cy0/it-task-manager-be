# Phân tích chức năng & UML - IT Task Manager Backend

## 1. Đánh giá sơ đồ "Quản lý Tài khoản"
### 1.1 Nhận xét
- Flow quên mật khẩu trong sơ đồ cũ chỉ thể hiện một use case duy nhất ("Quên mật khẩu") và mở rộng trực tiếp từ "Đăng nhập", trong khi hệ thống thực tế (authController) tách thành hai bước `POST /auth/reset-password/request` và `POST /auth/reset-password/confirm` với khâu xác minh token riêng.
- Việc phát hành Access/Refresh token, token rotation và refresh endpoint (`POST /auth/refresh`) không được mô tả, dẫn tới thiếu hụt logic bảo mật chính của backend.
- Các thao tác nhạy cảm như cập nhật hồ sơ hay đổi mật khẩu đều yêu cầu xác thực lại (re-auth) và validation nâng cao (`authValidation`), nhưng sơ đồ cũ chưa phản ánh mối quan hệ include này.

### 1.2 Sơ đồ đề xuất
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor User

rectangle "Quản lý Tài khoản" {
  usecase "Đăng ký" as UC_Register
  usecase "Đăng nhập" as UC_Login
  usecase "Làm mới token" as UC_Refresh
  usecase "Đăng xuất" as UC_Logout
  usecase "Xem hồ sơ" as UC_ViewProfile
  usecase "Cập nhật hồ sơ" as UC_UpdateProfile
  usecase "Đổi mật khẩu" as UC_ChangePass
  usecase "Yêu cầu quên mật khẩu" as UC_Forgot
  usecase "Xác nhận đặt lại\nmật khẩu" as UC_Reset
  usecase "Kiểm tra thông tin\nđăng nhập" as UC_VerifyCreds
  usecase "Xác thực lại\n(Re-auth)" as UC_Reauth
  usecase "Phát hành Access/Refresh Token" as UC_IssueTokens
  usecase "Gửi email đặt lại\nmật khẩu" as UC_SendReset
  usecase "Xác minh token đặt lại" as UC_ValidateReset
}

User --> UC_Register
User --> UC_Login
User --> UC_Refresh
User --> UC_Logout
User --> UC_ViewProfile
User --> UC_UpdateProfile
User --> UC_ChangePass
User --> UC_Forgot
User --> UC_Reset

UC_Login ..> UC_VerifyCreds : <<include>>
UC_Login ..> UC_IssueTokens : <<include>>
UC_Register ..> UC_IssueTokens : <<include>>
UC_Refresh ..> UC_IssueTokens : <<include>>
UC_ChangePass ..> UC_Reauth : <<include>>
UC_UpdateProfile ..> UC_Reauth : <<include>>
UC_Forgot ..> UC_SendReset : <<include>>
UC_Reset ..> UC_ValidateReset : <<include>>
UC_Reset ..> UC_IssueTokens : <<include>>
UC_Reset .> UC_Forgot : <<extend>>
UC_Forgot .> UC_Login : <<extend>>
@enduml
```

## 2. Đánh giá sơ đồ use case tổng quát
### 2.1 Nhận xét
- Sơ đồ cũ gom tất cả thao tác vào một khối duy nhất nên không thể hiện rõ ranh giới giữa các module thực tế (`auth`, `invite`, `project`, `task`, `column`, `notification`, `search`, `dashboard`).
- Quan hệ include/extend và ràng buộc quyền hạn (Owner vs Member) không xuất hiện, trong khi code backend dùng permission theo vai trò (`projectRolesModel`, `rolesMiddleware`).
- Các tác nhân phụ như dịch vụ email (Nodemailer) hay MeiliSearch ảnh hưởng trực tiếp tới flow nhưng chưa được mô hình hóa.

### 2.2 Sơ đồ tổng quan đề xuất
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor User
actor "Project Owner/Lead" as Owner
actor "Email Service" as Email

rectangle "Tài khoản & Hồ sơ" {
  usecase "Đăng nhập" as UC_Login
  usecase "Đăng ký" as UC_Register
  usecase "Đổi mật khẩu" as UC_ChangePwd
  usecase "Quên mật khẩu" as UC_ForgotPwd
  usecase "Cập nhật hồ sơ" as UC_UpdateProfile
  usecase "Đăng xuất" as UC_Logout
}

rectangle "Lời mời & Tham gia" {
  usecase "Tạo link mời" as UC_CreateInvite
  usecase "Gửi lời mời email" as UC_SendInvite
  usecase "Danh sách lời mời" as UC_ListInvites
  usecase "Chấp nhận lời mời" as UC_AcceptInvite
  usecase "Từ chối / Hủy lời mời" as UC_RejectInvite
  usecase "Tham gia qua link" as UC_JoinByLink
  usecase "Xác thực token mời" as UC_ValidateInvite
}

rectangle "Quản lý dự án & vai trò" {
  usecase "Tạo / Sửa / Xóa dự án" as UC_CRUDProject
  usecase "Xem dự án" as UC_ViewProject
  usecase "Quản lý thành viên" as UC_ManageMembers
  usecase "Cập nhật vai trò" as UC_UpdateRole
  usecase "Bật Free Mode" as UC_ToggleFreeMode
  usecase "Sắp xếp column" as UC_ReorderColumns
  usecase "Kiểm tra quyền" as UC_CheckPermission
}

rectangle "Board & Task" {
  usecase "Thêm / Sửa / Xóa column" as UC_CRUDColumn
  usecase "Di chuyển card" as UC_MoveCard
  usecase "Thêm / Sửa / Xóa task" as UC_CRUDTask
  usecase "Gán / Gỡ gán task" as UC_AssignTask
  usecase "Cập nhật trạng thái" as UC_UpdateStatus
}

rectangle "Thông báo" {
  usecase "Xem thông báo" as UC_ViewNoti
  usecase "Đánh dấu đã đọc" as UC_ReadNoti
  usecase "Xóa thông báo" as UC_DeleteNoti
  usecase "Xóa tất cả" as UC_ClearNoti
}

rectangle "Tìm kiếm & Dashboard" {
  usecase "Tìm kiếm toàn cục" as UC_GlobalSearch
  usecase "Tìm kiếm dự án/task" as UC_SearchEntities
  usecase "Xem dashboard" as UC_ViewDashboard
  usecase "Thống kê workload" as UC_TeamWorkload
  usecase "Hoạt động dự án" as UC_ProjectActivity
  usecase "Truy vấn MeiliSearch" as UC_QueryMeili
}

Owner --> UC_CreateInvite
Owner --> UC_SendInvite
Owner --> UC_CRUDProject
Owner --> UC_ManageMembers
Owner --> UC_UpdateRole
Owner --> UC_ToggleFreeMode
Owner --> UC_ReorderColumns
Owner --> UC_CheckPermission

User --> UC_Login
User --> UC_Register
User --> UC_ChangePwd
User --> UC_ForgotPwd
User --> UC_UpdateProfile
User --> UC_Logout
User --> UC_ListInvites
User --> UC_AcceptInvite
User --> UC_RejectInvite
User --> UC_JoinByLink
User --> UC_ViewProject
User --> UC_MoveCard
User --> UC_CRUDTask
User --> UC_AssignTask
User --> UC_UpdateStatus
User --> UC_ViewNoti
User --> UC_ReadNoti
User --> UC_DeleteNoti
User --> UC_ClearNoti
User --> UC_GlobalSearch
User --> UC_SearchEntities
User --> UC_ViewDashboard
User --> UC_TeamWorkload
User --> UC_ProjectActivity

Email --> UC_SendInvite

UC_SendInvite ..> UC_CreateInvite : <<include>>
UC_AcceptInvite ..> UC_ValidateInvite : <<include>>
UC_RejectInvite ..> UC_ValidateInvite : <<include>>
UC_JoinByLink ..> UC_ValidateInvite : <<include>>
UC_ManageMembers ..> UC_CheckPermission : <<include>>
UC_UpdateRole ..> UC_CheckPermission : <<include>>
UC_ToggleFreeMode ..> UC_CheckPermission : <<include>>
UC_ReorderColumns ..> UC_CheckPermission : <<include>>
UC_CRUDTask ..> UC_CheckPermission : <<include>>
UC_AssignTask ..> UC_CheckPermission : <<include>>
UC_GlobalSearch ..> UC_QueryMeili : <<include>>
UC_SearchEntities ..> UC_QueryMeili : <<include>>
@enduml
```

## 3. Phạm vi chức năng chính của backend
1. **Quản lý tài khoản & hồ sơ** (authController/authService): đăng ký, đăng nhập, refresh token, quản lý hồ sơ, đổi/quên mật khẩu.
2. **Lời mời & tham gia dự án** (inviteController/inviteService): tạo link, gửi email, chấp nhận/từ chối/hủy lời mời, join qua token.
3. **Quản lý dự án & vai trò** (projectController, projectRolesController, rolesMiddleware): CRUD dự án, quản lý thành viên, phân quyền, free mode, reorder columns.
4. **Quản lý board/column** (columnController/columnService): CRUD column, lấy danh sách theo project, di chuyển card giữa column.
5. **Quản lý task** (taskController/taskService): CRUD, gán/gỡ gán, cập nhật trạng thái, log hoạt động, đồng bộ MeiliSearch.
6. **Thông báo** (notiController/notiService): đọc, xóa, xóa tất cả, lấy chi tiết.
7. **Tìm kiếm & Dashboard** (searchController/searchService, dashboardController/dashboardService): global search qua MeiliSearch, thống kê dự án, workload, activity feed.

## 4. UML chi tiết cho từng chức năng
### 4.1 Quản lý tài khoản & hồ sơ
**Phạm vi**: Các endpoint trong `src/routes/auth`, bao gồm đăng ký/đăng nhập, refresh token, quản lý profile và password, reset password flow.

**Use case**
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor User

rectangle "Auth & Profile" {
  usecase "Đăng ký" as UC_Register
  usecase "Đăng nhập" as UC_Login
  usecase "Làm mới token" as UC_Refresh
  usecase "Đăng xuất" as UC_Logout
  usecase "Xem hồ sơ" as UC_ViewProfile
  usecase "Cập nhật hồ sơ" as UC_UpdateProfile
  usecase "Đổi mật khẩu" as UC_ChangePass
  usecase "Yêu cầu reset" as UC_Forgot
  usecase "Xác nhận reset" as UC_Reset
  usecase "Xác thực lại" as UC_Reauth
  usecase "Phát hành token" as UC_IssueTokens
}

User --> UC_Register
User --> UC_Login
User --> UC_Refresh
User --> UC_Logout
User --> UC_ViewProfile
User --> UC_UpdateProfile
User --> UC_ChangePass
User --> UC_Forgot
User --> UC_Reset

UC_Login ..> UC_IssueTokens : <<include>>
UC_Register ..> UC_IssueTokens : <<include>>
UC_Refresh ..> UC_IssueTokens : <<include>>
UC_UpdateProfile ..> UC_Reauth : <<include>>
UC_ChangePass ..> UC_Reauth : <<include>>
UC_Reset .> UC_Forgot : <<extend>>
@enduml
```

**Sequence (Đăng nhập & phát hành token)**
```plantuml
@startuml
actor User
participant "Auth API\n(POST /auth/login)" as API
participant "authController" as Controller
participant "authService" as Service
participant "authRepository" as Repo
database MongoDB
participant "JWT Utils" as JWT
participant "refreshTokenRepository" as RefreshRepo

User -> API : email, password
API -> Controller : HTTP request
Controller -> Service : login(credentials)
Service -> Repo : findByEmail(email)
Repo -> MongoDB : query users
MongoDB --> Repo : user doc
Service -> Service : verify password (bcrypt)
Service -> JWT : generate access token
Service -> JWT : generate refresh token
Service -> RefreshRepo : saveRefreshToken(userId, token)
Controller <-- Service : tokens + profile
User <-- Controller : 200 OK + JWTs
@enduml
```

### 4.2 Lời mời & tham gia dự án
**Phạm vi**: `src/routes/home/inviteRoute.js` với các hoạt động tạo link, gửi email, xử lý token khi join.

**Use case**
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Owner/Lead" as Owner
actor "Thành viên" as Member
actor "Email Service" as Email

rectangle "Quản lý lời mời" {
  usecase "Tạo link mời vĩnh viễn" as UC_CreateLink
  usecase "Gửi lời mời email" as UC_EmailInvite
  usecase "Xem danh sách lời mời" as UC_ListInvites
  usecase "Chấp nhận lời mời" as UC_AcceptInvite
  usecase "Từ chối lời mời" as UC_RejectInvite
  usecase "Hủy lời mời" as UC_CancelInvite
  usecase "Tham gia dự án qua link" as UC_JoinByLink
  usecase "Xác thực token lời mời" as UC_ValidateInvite
}

Owner --> UC_CreateLink
Owner --> UC_EmailInvite
Owner --> UC_CancelInvite
Member --> UC_ListInvites
Member --> UC_AcceptInvite
Member --> UC_RejectInvite
Member --> UC_JoinByLink
Email --> UC_EmailInvite

UC_EmailInvite ..> UC_CreateLink : <<include>>
UC_AcceptInvite ..> UC_ValidateInvite : <<include>>
UC_RejectInvite ..> UC_ValidateInvite : <<include>>
UC_JoinByLink ..> UC_ValidateInvite : <<include>>
UC_CancelInvite ..> UC_ValidateInvite : <<include>>
@enduml
```

**Sequence (Join dự án qua invite link)**
```plantuml
@startuml
actor Member
participant "Invite API\n(GET /home/invites/{token})" as API
participant "inviteController" as Controller
participant "inviteService" as Service
participant "inviteRepository" as InviteRepo
participant "projectRepository" as ProjectRepo
database MongoDB

Member -> API : token + JWT
API -> Controller : HTTP request
Controller -> Service : handleInviteLink(token, userId)
Service -> InviteRepo : findByToken(token)
InviteRepo -> MongoDB : query invites
MongoDB --> InviteRepo : invite doc
Service -> ProjectRepo : addMember(projectId, userId)
ProjectRepo -> MongoDB : update project.members
Service -> InviteRepo : markInviteAccepted(inviteId)
Controller <-- Service : project_id, role
Member <-- Controller : 200 OK + joined project
@enduml
```

### 4.3 Quản lý dự án & vai trò
**Phạm vi**: `projectController`, `projectRolesController`, các middleware kiểm quyền và service `projectService` (create project, quản lý thành viên, free mode, reorder column).

**Use case**
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Owner
actor "Project Member" as Member

rectangle "Quản lý dự án & vai trò" {
  usecase "Tạo dự án" as UC_CreateProject
  usecase "Cập nhật dự án" as UC_UpdateProject
  usecase "Xóa dự án" as UC_DeleteProject
  usecase "Xem danh sách/chi tiết" as UC_ViewProject
  usecase "Thêm thành viên" as UC_AddMember
  usecase "Gỡ thành viên" as UC_RemoveMember
  usecase "Cập nhật vai trò" as UC_UpdateRole
  usecase "Bật/Tắt Free Mode" as UC_ToggleFreeMode
  usecase "Sắp xếp column" as UC_ReorderColumns
  usecase "Kiểm tra quyền" as UC_CheckPermission
}

Owner --> UC_CreateProject
Owner --> UC_UpdateProject
Owner --> UC_DeleteProject
Owner --> UC_AddMember
Owner --> UC_RemoveMember
Owner --> UC_UpdateRole
Owner --> UC_ToggleFreeMode
Owner --> UC_ReorderColumns
Member --> UC_ViewProject
Member --> UC_AddMember
Member --> UC_RemoveMember

UC_AddMember ..> UC_CheckPermission : <<include>>
UC_RemoveMember ..> UC_CheckPermission : <<include>>
UC_UpdateRole ..> UC_CheckPermission : <<include>>
UC_ToggleFreeMode ..> UC_CheckPermission : <<include>>
UC_ReorderColumns ..> UC_CheckPermission : <<include>>
UC_CreateProject ..> UC_CheckPermission : <<include>>
@enduml
```

**Sequence (Owner tạo dự án mới)**
```plantuml
@startuml
actor Owner
participant "Project API\n(POST /home/projects)" as API
participant "projectController" as Controller
participant "projectService" as Service
participant "projectRepository" as ProjectRepo
participant "projectRolesModel" as RoleModel
participant "inviteService" as InviteSvc
participant "searchRepository" as SearchRepo
database MongoDB

Owner -> API : payload + JWT
API -> Controller : HTTP request
Controller -> Service : createNew(data+ownerId)
Service -> ProjectRepo : insert project (txn)
ProjectRepo -> MongoDB : insert document
MongoDB --> ProjectRepo : projectId
Service -> RoleModel : clone default roles
RoleModel -> MongoDB : insert project_roles
Service -> ProjectRepo : add owner as member
Service -> InviteSvc : createPermanentInvite(projectId, ownerId)
Service -> SearchRepo : syncProjectToMeili(projectDoc)
Controller <-- Service : project + invite link
Owner <-- Controller : 201 Created
@enduml
```

### 4.4 Quản lý column (board)
**Phạm vi**: `columnController`, `columnService`, `columnRepository`, liên quan đến CRUD column và move card.

**Use case**
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Project Member" as Member
actor Owner

rectangle "Board/Column" {
  usecase "Danh sách column theo project" as UC_ListColumns
  usecase "Thêm column" as UC_AddColumn
  usecase "Cập nhật column" as UC_UpdateColumn
  usecase "Xóa column" as UC_DeleteColumn
  usecase "Xem column + cards" as UC_ViewColumn
  usecase "Di chuyển card" as UC_MoveCard
}

Owner --> UC_ListColumns
Owner --> UC_AddColumn
Owner --> UC_UpdateColumn
Owner --> UC_DeleteColumn
Owner --> UC_MoveCard
Member --> UC_ListColumns
Member --> UC_ViewColumn
Member --> UC_MoveCard

UC_AddColumn ..> UC_ListColumns : <<include>>
UC_DeleteColumn ..> UC_ListColumns : <<include>>
UC_MoveCard ..> UC_ViewColumn : <<include>>
@enduml
```

**Sequence (Di chuyển card giữa hai column)**
```plantuml
@startuml
actor Member
participant "Column API\n(PATCH /columns/cards/move)" as API
participant "columnController" as Controller
participant "columnService" as Service
participant "taskRepository" as TaskRepo
participant "columnRepository" as ColumnRepo
database MongoDB

Member -> API : cardId, fromColumnId, toColumnId, position
API -> Controller : HTTP request
Controller -> Service : moveCard(params)
Service -> TaskRepo : updateById(cardId,{columnId:to})
TaskRepo -> MongoDB : update task
Service -> ColumnRepo : removeCardFromColumn(fromColumnId, cardId)
ColumnRepo -> MongoDB : pull cardId
Service -> ColumnRepo : addCardToColumn(toColumnId, cardId, position)
ColumnRepo -> MongoDB : push cardId
Service --> Controller : success message
Controller --> Member : 200 OK "Card moved"
@enduml
```

### 4.5 Quản lý task
**Phạm vi**: `taskController`, `taskService`, `taskRepository`, tích hợp với `projectService`, `columnRepository`, MeiliSearch và server log.

**Use case**
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Lead/Member" as TaskActor

rectangle "Task Lifecycle" {
  usecase "Tạo task" as UC_CreateTask
  usecase "Cập nhật task" as UC_UpdateTask
  usecase "Xóa task" as UC_DeleteTask
  usecase "Xem task" as UC_ViewTask
  usecase "Lọc danh sách" as UC_FilterTasks
  usecase "Gán task" as UC_AssignTask
  usecase "Gỡ gán task" as UC_UnassignTask
  usecase "Cập nhật trạng thái" as UC_UpdateStatus
  usecase "Đồng bộ MeiliSearch" as UC_SyncMeili
  usecase "Ghi log hoạt động" as UC_LogActivity
}

TaskActor --> UC_CreateTask
TaskActor --> UC_UpdateTask
TaskActor --> UC_DeleteTask
TaskActor --> UC_ViewTask
TaskActor --> UC_FilterTasks
TaskActor --> UC_AssignTask
TaskActor --> UC_UnassignTask
TaskActor --> UC_UpdateStatus

UC_CreateTask ..> UC_SyncMeili : <<include>>
UC_CreateTask ..> UC_LogActivity : <<include>>
UC_UpdateTask ..> UC_SyncMeili : <<include>>
UC_UpdateTask ..> UC_LogActivity : <<include>>
UC_DeleteTask ..> UC_LogActivity : <<include>>
UC_AssignTask ..> UC_LogActivity : <<include>>
UC_AssignTask ..> UC_SyncMeili : <<include>>
UC_UnassignTask ..> UC_LogActivity : <<include>>
UC_UpdateStatus ..> UC_LogActivity : <<include>>
UC_UpdateStatus ..> UC_SyncMeili : <<include>>
@enduml
```

**Sequence (Gán task cho thành viên)**
```plantuml
@startuml
actor Lead
participant "Task API\n(POST /home/tasks/{id}/assign)" as API
participant "taskController" as Controller
participant "taskService" as Service
participant "taskRepository" as TaskRepo
participant "projectService" as ProjectSvc
participant "searchRepository" as SearchRepo
participant "serverLogService" as LogSvc
database MongoDB

Lead -> API : taskId, user_id, role_id
API -> Controller : HTTP request
Controller -> Service : assignTask(taskId, payload, actorId)
Service -> TaskRepo : getTaskById(taskId)
TaskRepo -> MongoDB : find task
MongoDB --> TaskRepo : task doc
Service -> TaskRepo : assignTask(taskId, payload)
TaskRepo -> MongoDB : update assignees
Service -> ProjectSvc : touch(projectId)
Service -> SearchRepo : syncTaskToMeili(updatedTask)
Service -> LogSvc : createLog(actorId, task info)
Controller <-- Service : updated task
Lead <-- Controller : 200 OK + task data
@enduml
```

### 4.6 Hệ thống thông báo
**Phạm vi**: `notiController`, `notiService`, `notiRepository`.

**Use case**
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor User

rectangle "Notification" {
  usecase "Xem danh sách thông báo" as UC_ViewNoti
  usecase "Xem chi tiết" as UC_ViewDetail
  usecase "Đánh dấu đã đọc" as UC_MarkRead
  usecase "Xóa thông báo" as UC_DeleteNoti
  usecase "Xóa tất cả" as UC_ClearAll
}

User --> UC_ViewNoti
User --> UC_ViewDetail
User --> UC_MarkRead
User --> UC_DeleteNoti
User --> UC_ClearAll

UC_ClearAll ..> UC_DeleteNoti : <<include>>
@enduml
```

**Sequence (Đánh dấu một thông báo đã đọc)**
```plantuml
@startuml
actor User
participant "Noti API\n(PATCH /home/noti/{id})" as API
participant "notiController" as Controller
participant "notiService" as Service
participant "notiRepository" as Repo
database MongoDB

User -> API : notiId, is_read=true
API -> Controller : HTTP request
Controller -> Service : markAsRead(notiId)
Service -> Repo : getNotiById(notiId)
Repo -> MongoDB : find notification
MongoDB --> Repo : noti doc
Service -> Repo : markAsRead(notiId)
Repo -> MongoDB : update document
Controller <-- Service : updated noti
User <-- Controller : 200 OK + status
@enduml
```

### 4.7 Tìm kiếm & Dashboard
**Phạm vi**: `searchController/searchService` (MeiliSearch), `dashboardController/dashboardService` (thống kê, workload, activity).

**Use case**
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor User
actor "MeiliSearch" as Meili

rectangle "Search & Dashboard" {
  usecase "Tìm kiếm toàn cục" as UC_GlobalSearch
  usecase "Tìm dự án" as UC_SearchProjects
  usecase "Tìm task" as UC_SearchTasks
  usecase "Tìm người dùng" as UC_SearchUsers
  usecase "Xem tổng quan dashboard" as UC_ViewDashboard
  usecase "Xem workload đội" as UC_TeamWorkload
  usecase "Xem hoạt động dự án" as UC_ProjectActivity
  usecase "Truy vấn Meili" as UC_QueryMeili
}

User --> UC_GlobalSearch
User --> UC_SearchProjects
User --> UC_SearchTasks
User --> UC_SearchUsers
User --> UC_ViewDashboard
User --> UC_TeamWorkload
User --> UC_ProjectActivity

Meili --> UC_QueryMeili
UC_GlobalSearch ..> UC_QueryMeili : <<include>>
UC_SearchProjects ..> UC_QueryMeili : <<include>>
UC_SearchTasks ..> UC_QueryMeili : <<include>>
UC_SearchUsers ..> UC_QueryMeili : <<include>>
@enduml
```

**Sequence (Tìm kiếm toàn cục)**
```plantuml
@startuml
actor User
participant "Search API\n(GET /home/search)" as API
participant "searchController" as Controller
participant "searchService" as Service
participant "Meili projects" as MeiliProjects
participant "Meili tasks" as MeiliTasks
participant "Meili users" as MeiliUsers

User -> API : q, limit, offset
API -> Controller : HTTP request
Controller -> Service : globalSearch(q, userId)
Service -> MeiliProjects : searchProjects(q, filters)
Service -> MeiliTasks : searchTasks(q, filters)
Service -> MeiliUsers : searchUsers(q)
MeiliProjects --> Service : project hits
MeiliTasks --> Service : task hits
MeiliUsers --> Service : user hits
Controller <-- Service : aggregated results
User <-- Controller : 200 OK + projects/tasks/users
@enduml
```

---
Tài liệu này mô tả lại các sơ đồ use case và sequence sát với codebase hiện tại (`src/controllers`, `src/services`, `src/repository`), giúp dễ dàng đối chiếu khi cập nhật tính năng hoặc viết tài liệu hệ thống.
