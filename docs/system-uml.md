# IT Task Manager – UML Pack
_Date: 2025-12-03_

Actors in scope:
- **Owner** – dự án admin, toàn quyền.
- **Member** – thành viên thông thường trong dự án.

Chỉ cung cấp 10 biểu đồ được yêu cầu, theo đúng phạm vi backend hiện tại.

---

## 1. Biểu đồ Use Case tổng quát hệ thống
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Owner
actor Member

rectangle {
	usecase "Đăng nhập" as UC_Login
	usecase "Quản lý hồ sơ" as UC_Profile
	usecase "Quản lý thành viên" as UC_MemberMgmt
	usecase "Quản lý bảng" as UC_BoardMgmt
	usecase "Quản lý task" as UC_TaskMgmt
	usecase "Nhận thông báo" as UC_Notifications
}

Owner --> UC_Login
Owner --> UC_Profile
Owner --> UC_MemberMgmt
Owner --> UC_BoardMgmt
Owner --> UC_TaskMgmt
Owner --> UC_Notifications

Member --> UC_Login
Member --> UC_Profile
Member --> UC_BoardMgmt
Member --> UC_TaskMgmt
Member --> UC_Notifications
@enduml
```

---

## 2. Biểu đồ use case đăng nhập
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Owner
actor Member

rectangle "Đăng nhập" {
	usecase "Nhập email & mật khẩu" as UC_Input
	usecase "Xác thực thông tin" as UC_Validate
	usecase "Cấp token" as UC_Token
}

Owner --> UC_Input
Member --> UC_Input

UC_Input ..> UC_Validate : <<include>>
UC_Validate ..> UC_Token : <<include>>
@enduml
```

---

## 3. Biểu đồ trình tự đăng nhập
```plantuml
@startuml
actor User as Owner
participant "API Gateway" as API
participant "authController" as Ctrl
participant "authService" as Service
participant "authRepository" as Repo
database MongoDB

Owner -> API: POST /auth/login
API -> Ctrl: login()
Ctrl -> Service: login(credentials)
Service -> Repo: findUserByEmail()
Repo --> Service: user
Service -> Service: bcrypt.compare()
Service -> Service: generateTokens()
Service -> Repo: saveRefreshToken()
Repo --> Service
Service --> Ctrl: auth payload
Ctrl --> API: 200 OK
API --> Owner: accessToken + refreshToken
@enduml
```

---

## 4. Biểu đồ use case quản lý thông tin cá nhân
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Owner
actor Member

rectangle {
	usecase "Xem thông tin cá nhân" as UC_ViewProfile
	usecase "Cập nhật thông tin" as UC_UpdateProfile
	usecase "Đổi mật khẩu" as UC_ChangePassword
}

Owner --> UC_ViewProfile
Owner --> UC_UpdateProfile
Owner --> UC_ChangePassword

Member --> UC_ViewProfile
Member --> UC_UpdateProfile
Member --> UC_ChangePassword

UC_UpdateProfile ..> UC_ViewProfile : <<include>>
UC_ChangePassword ..> UC_ViewProfile : <<include>>
@enduml
```

---

## 5. Biểu đồ trình tự quản lý thông tin cá nhân
```plantuml
@startuml
actor User as Member
participant "API Gateway" as API
participant "authController" as Ctrl
participant "authService" as Service
participant "authRepository" as Repo
database MongoDB

Member -> API: PUT /auth/me (profile data)
API -> Ctrl: updateProfile()
Ctrl -> Service: updateProfile(userId, data)
Service -> Repo: updateUserById()
Repo --> Service: updated user
Service --> Ctrl: sanitized profile
Ctrl --> API: 200 OK
API --> Member: updated profile

== Change password ==
Member -> API: PUT /auth/me/password
API -> Ctrl: changePassword()
Ctrl -> Service: changePassword(userId, payload)
Service -> Repo: findUserById()
Repo --> Service: user
Service -> Service: bcrypt.compare()
Service -> Repo: updateUserById(new hash)
Repo --> Service
Service --> Ctrl: success
Ctrl --> API: 200 OK
API --> Member: confirmation
@enduml
```

---

## 6. Biểu đồ use case quản lý thành viên
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Owner
actor Member

rectangle {
	usecase "Xem danh sách" as UC_ListMembers
	usecase "Thêm thành viên" as UC_AddMember
	usecase "Cập nhật vai trò" as UC_UpdateRole
	usecase "Loại bỏ thành viên" as UC_RemoveMember
}

Owner --> UC_ListMembers
Owner --> UC_AddMember
Owner --> UC_UpdateRole
Owner --> UC_RemoveMember

Member --> UC_ListMembers
@enduml
```

---

## 7. Biểu đồ trình tự quản lý thành viên
```plantuml
@startuml
actor Owner
participant "API Gateway" as API
participant "projectController" as Ctrl
participant "projectService" as Service
participant "projectRepository" as Repo
database MongoDB

Owner -> API: POST /home/projects/{id}/members
API -> Ctrl: addProjectMember()
Ctrl -> Service: addProjectMember(projectId, body, ownerId)
Service -> Repo: findProjectById()
Repo --> Service: project
Service -> Repo: pushMember()
Repo --> Service: updated project
Service --> Ctrl: member info
Ctrl --> API: 200 OK
API --> Owner: confirmation

== Update role ==
Owner -> API: PUT /home/projects/{id}/roles
API -> Ctrl: updateMemberRole()
Ctrl -> Service: updateProjectMemberRole(projectId, change)
Service -> Repo: updateMemberRole()
Repo --> Service
Service --> Ctrl: result
Ctrl --> API: 200 OK
API --> Owner: updated list
@enduml
```

---

## 8. Biểu đồ use case quản lý bảng
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Owner
actor Member

rectangle {
	usecase "Xem board" as UC_ViewBoard
	usecase "Tạo column" as UC_CreateColumn
	usecase "Đổi tên/Xóa column" as UC_ModifyColumn
	usecase "Di chuyển card" as UC_MoveCard
	usecase "Sắp xếp column" as UC_OrderColumns
}

Owner --> UC_ViewBoard
Owner --> UC_CreateColumn
Owner --> UC_ModifyColumn
Owner --> UC_MoveCard
Owner --> UC_OrderColumns

Member --> UC_ViewBoard
Member --> UC_MoveCard
Member --> UC_OrderColumns
@enduml
```

---

## 9. Biểu đồ trình tự quản lý bảng
```plantuml
@startuml
actor Member
participant "API Gateway" as API
participant "columnController" as Ctrl
participant "columnService" as Service
participant "columnRepository" as ColumnRepo
participant "taskRepository" as TaskRepo
database MongoDB

Member -> API: POST /home/columns/projects/{projectId}
API -> Ctrl: create()
Ctrl -> Service: create(projectId, data, userId)
Service -> ColumnRepo: insertColumn()
ColumnRepo --> Service: column
Service --> Ctrl: column DTO
Ctrl --> API: 201 CREATED
API --> Member: column info

== Move card ==
Member -> API: PATCH /home/columns/cards/move
API -> Ctrl: moveCard()
Ctrl -> Service: moveCard(taskId, from, to, position)
Service -> TaskRepo: getTaskById()
TaskRepo --> Service: task
Service -> ColumnRepo: removeCard(from)
ColumnRepo --> Service
Service -> ColumnRepo: insertCard(to, position)
ColumnRepo --> Service
Service -> TaskRepo: updateTask(columnId)
TaskRepo --> Service
Service --> Ctrl: board snapshot
Ctrl --> API: 200 OK
API --> Member: updated board
@enduml
```

---

## 10. Biểu đồ use case quản lý task
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Owner
actor Member

rectangle "Quản lý task" {
	usecase "Xem danh sách" as UC_ViewTasks
	usecase "Tạo task" as UC_CreateTask
	usecase "Cập nhật task" as UC_UpdateTask
	usecase "Xóa task" as UC_DeleteTask
	usecase "Gán/Gỡ thành viên" as UC_AssignTask
	usecase "Cập nhật trạng thái" as UC_UpdateStatus
}

Owner --> UC_ViewTasks
Owner --> UC_CreateTask
Owner --> UC_UpdateTask
Owner --> UC_DeleteTask
Owner --> UC_AssignTask
Owner --> UC_UpdateStatus

Member --> UC_ViewTasks
Member --> UC_CreateTask
Member --> UC_UpdateTask
Member --> UC_AssignTask
Member --> UC_UpdateStatus
@enduml
```

---

## 11. Biểu đồ trình tự quản lý task
```plantuml
@startuml
actor Member
participant "API Gateway" as API
participant "taskController" as Ctrl
participant "taskService" as Service
participant "taskRepository" as Repo
participant "projectService" as ProjectSvc
participant "serverLogService" as LogSvc
participant "searchRepository" as SearchRepo
database MongoDB

Member -> API: PATCH /home/tasks/{id}/status
API -> Ctrl: updateTaskStatus()
Ctrl -> Service: updateTaskStatus(taskId, status, actorId)
Service -> Repo: getTaskById(taskId)
Repo --> Service: task
Service -> Repo: updateTaskStatus(taskId, status)
Repo --> Service: updatedTask
Service -> ProjectSvc: touch(projectId, updatedAt)
ProjectSvc --> Service: ok
Service -> SearchRepo: syncTaskToMeili(updatedTask)
SearchRepo --> Service: synced
Service -> LogSvc: createLog(actorId, details)
LogSvc --> Service: logged
Service --> Ctrl: updatedTask DTO
Ctrl --> API: 200 OK
API --> Member: task sau khi cập nhật
@enduml
```

---

## 12. Biểu đồ lớp tổng quát hệ thống
```plantuml
@startuml
skinparam classAttributeIconSize 0

class AuthController {
	+login()
	+updateProfile()
	+changePassword()
}
class ProjectController {
	+addProjectMember()
	+updateProject()
	+reorderColumns()
}
class ColumnController {
	+create()
	+moveCard()
}
class AuthService {
	+login()
	+updateProfile()
	+changePassword()
}
class ProjectService {
	+createNew()
	+addProjectMember()
	+updateProjectMemberRole()
}
class ColumnService {
	+create()
	+moveCard()
}
class AuthRepository {
	+findUserByEmail()
	+updateUserById()
}
class ProjectRepository {
	+insertProject()
	+updateMemberRole()
}
class ColumnRepository {
	+insertColumn()
	+reorderCards()
}
class TaskRepository {
	+getTaskById()
	+updateTask()
}
class NotificationService
class ServerLogService

AuthController --> AuthService
AuthService --> AuthRepository
ProjectController --> ProjectService
ProjectService --> ProjectRepository
ProjectService --> TaskRepository
ColumnController --> ColumnService
ColumnService --> ColumnRepository
ColumnService --> TaskRepository
AuthService --> NotificationService : emits
ProjectService --> ServerLogService : logs
@enduml
```

---

## Đặc tả Use Case
Ngôn ngữ trình bày thống nhất theo mẫu đã cung cấp. Mỗi use case phía dưới đều mô tả Tác nhân, bối cảnh, dòng sự kiện chính và kết quả.

### 1. Đặc tả use case Đăng nhập
- **Tác nhân**: Owner, Member.
- **Mô tả**: Khi tác nhân cần sử dụng hệ thống, họ phải đăng nhập bằng tài khoản đã được cấp. Sau khi hoàn thành công việc có thể đăng xuất khỏi hệ thống.
- **Dòng sự kiện chính**:
	1. Tác nhân yêu cầu giao diện đăng nhập.
	2. Hệ thống hiển thị form nhập email và mật khẩu.
	3. Tác nhân nhập thông tin đăng nhập và gửi yêu cầu.
	4. Hệ thống kiểm tra dữ liệu, đối chiếu với cơ sở dữ liệu và xác nhận.
	5. Nếu hợp lệ, hệ thống phát hành access token/refresh token, thông báo thành công và chuyển tác nhân vào giao diện chính.
	6. Nếu không hợp lệ, hệ thống thông báo "Bạn đã đăng nhập sai tên tài khoản hoặc mật khẩu" và giữ tác nhân ở màn hình đăng nhập để nhập lại.

### 2. Đặc tả use case Quản lý hồ sơ
- **Tác nhân**: Owner, Member.
- **Mô tả**: Tác nhân xem và cập nhật thông tin cá nhân (họ tên, avatar, thông tin liên hệ) cũng như thay đổi mật khẩu khi cần.
- **Dòng sự kiện chính**:
	1. Tác nhân chọn chức năng "Hồ sơ của tôi".
	2. Hệ thống tải dữ liệu hồ sơ hiện tại và hiển thị trên giao diện.
	3. Tác nhân chỉnh sửa trường cần thay đổi và gửi yêu cầu lưu.
	4. Hệ thống xác thực token, kiểm tra định dạng dữ liệu, cập nhật vào DB.
	5. Hệ thống trả về thông báo "Cập nhật hồ sơ thành công" cùng dữ liệu mới.
	6. Nếu tác nhân chọn đổi mật khẩu, hệ thống yêu cầu mật khẩu hiện tại để xác minh trước khi lưu mật khẩu mới.

### 3. Đặc tả use case Quản lý thành viên
- **Tác nhân**: Owner (chủ dự án). Member chỉ có quyền xem danh sách.
- **Mô tả**: Owner quản lý danh sách thành viên của dự án (thêm, cập nhật vai trò, loại bỏ). Member chỉ được xem thông tin để phối hợp.
- **Dòng sự kiện chính**:
	1. Owner mở trang "Thành viên" của dự án.
	2. Hệ thống liệt kê danh sách hiện tại kèm vai trò.
	3. Owner chọn hành động: thêm thành viên (qua email hoặc ID), đổi vai trò, hay loại bỏ.
	4. Hệ thống xác thực quyền `add_member`/`update_role`/`remove_member` tương ứng.
	5. Hệ thống cập nhật DB, ghi log hoạt động và gửi thông báo liên quan.
	6. Hệ thống trả kết quả cho Owner; Member được thấy danh sách đã cập nhật ở lần tải tiếp theo.

### 4. Đặc tả use case Quản lý bảng
- **Tác nhân**: Owner, Member.
- **Mô tả**: Tác nhân thao tác trực quan trên board Kanban của dự án: tạo column, đổi tên, xóa, sắp xếp thứ tự và kéo thả card.
- **Dòng sự kiện chính**:
	1. Tác nhân mở board của dự án.
	2. Hệ thống tải danh sách column và card theo thứ tự hiện tại.
	3. Tác nhân chọn hành động: thêm column mới, đổi tên, xóa, hay kéo thả card giữa các column.
	4. Hệ thống xác thực quyền can thiệp board, kiểm tra dữ liệu và cập nhật column/card tương ứng.
	5. Hệ thống đồng bộ lại thứ tự, phản hồi realtime cho tác nhân và lưu thay đổi xuống cơ sở dữ liệu.
	6. Kết thúc khi mọi thay đổi đã hiển thị trên giao diện board mới.

### 5. Đặc tả use case Quản lý task
- **Tác nhân**: Owner, Member.
- **Mô tả**: Tác nhân tạo, chỉnh sửa, gán người thực hiện, cập nhật trạng thái hoặc xóa task trong phạm vi dự án của họ.
- **Dòng sự kiện chính**:
	1. Tác nhân vào module task của một dự án.
	2. Hệ thống hiển thị danh sách task kèm bộ lọc.
	3. Tác nhân thực hiện hành động (tạo mới, sửa nội dung, gán thành viên, đổi trạng thái, xóa).
	4. Hệ thống kiểm tra quyền thao tác (ví dụ phải là người tạo hoặc có vai trò phù hợp), xác thực dữ liệu nhập.
	5. Sau khi lưu DB, hệ thống đồng bộ MeiliSearch, cập nhật log hoạt động và trả về thông báo "Thao tác với task thành công".
	6. Nếu có lỗi (thiếu quyền, dữ liệu sai), hệ thống phản hồi thông báo lỗi chi tiết và yêu cầu tác nhân điều chỉnh.

### 6. Đặc tả use case Nhận thông báo
- **Tác nhân**: Owner, Member.
- **Mô tả**: Tác nhân xem danh sách thông báo, đọc chi tiết, đánh dấu đã đọc hoặc xóa các thông báo trong hộp thư của mình.
- **Dòng sự kiện chính**:
	1. Tác nhân mở mục "Thông báo".
	2. Hệ thống truy vấn các thông báo chưa/đã đọc và hiển thị danh sách mới nhất.
	3. Tác nhân chọn một thông báo để xem chi tiết hoặc đánh dấu đã đọc hàng loạt.
	4. Hệ thống cập nhật trạng thái đọc trong DB.
	5. Nếu tác nhân chọn xóa, hệ thống sẽ gỡ thông báo khỏi danh sách của người dùng và phản hồi "Xóa thông báo thành công".
	6. Trường hợp không có thông báo, hệ thống hiển thị lời nhắc "Bạn đã xem hết thông báo".

	---

	## Tài liệu tham khảo


