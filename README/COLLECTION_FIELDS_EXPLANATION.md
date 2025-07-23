## 📁 1. Users Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của user, tự động tạo bởi MongoDB |
| username | String | Tên đăng nhập, duy nhất, có index để tìm kiếm nhanh |
| email | String | Email của user, duy nhất, có index, dùng cho đăng nhập và thông báo |
| full_name | String | Họ tên đầy đủ của user, hiển thị trong giao diện |
| role_id | ObjectId | Tham chiếu đến Roles, xác định quyền hạn của user |
| avatar_url | String | URL ảnh đại diện, null nếu chưa upload |
| phone | String | Số điện thoại liên lạc, tùy chọn |
| department | String | Phòng ban làm việc, dùng để phân nhóm |
| language | String | Ngôn ngữ giao diện ưa thích (enum: ["vi", "en", "jp", "fr"]) |
| contacts | Array[ObjectId] | Danh sách bạn bè/đồng nghiệp để chat nhanh, tham chiếu Users |
| created_at | Timestamp | Thời điểm tạo tài khoản, có index để sắp xếp |
| updated_at | Timestamp | Thời điểm cập nhật thông tin gần nhất |
| _destroy | Boolean | Đánh dấu xóa mềm (false: hoạt động, true: đã xóa) |

**Ghi chú:** Các trường isActive và veryfyTocken không có trong schema mới nhất, có thể đã bị xóa hoặc không được sử dụng.

## 🧑‍💼 2. Roles Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của role |
| name | String | Tên role (admin, developer...), duy nhất |
| permissions | Array[String] | Danh sách quyền hạn (create_project, view_task...) |
| description | String | Mô tả chi tiết về role, tùy chọn |
| created_at | Timestamp | Thời điểm tạo role |
| _destroy | Boolean | Đánh dấu xóa mềm (false: hoạt động, true: đã xóa) |
## 📊 3. Projects Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của project |
| name | String | Tên project, có index để tìm kiếm |
| description | String | Mô tả chi tiết về project, tùy chọn |
| status | String | Trạng thái (enum: ["planning", "in_progress", "testing", "completed"]) |
| priority | String | Độ ưu tiên (enum: ["low", "medium", "high"]) |
| progress | Number | Phần trăm hoàn thành (0-100) |
| start_date | Date | Ngày bắt đầu dự kiến, tùy chọn |
| end_date | Date | Ngày kết thúc dự kiến, tùy chọn |
| created_by | ObjectId | User tạo project, tham chiếu Users |
| team_lead | ObjectId | Trưởng nhóm chính, tham chiếu Users, tùy chọn |
| deputy_lead | ObjectId | Phó nhóm, tham chiếu Users, tùy chọn |
| members | Array[Object] | Danh sách thành viên |
| members.user_id | ObjectId | ID của thành viên, tham chiếu Users |
| members.role_id | ObjectId | Vai trò trong project, tham chiếu Roles |
| members.joined_at | Timestamp | Thời điểm tham gia |
| permissions | Object | Quyền hạn trong project |
| permissions.can_edit | Array[ObjectId] | Users có thể chỉnh sửa project |
| permissions.can_delete | Array[ObjectId] | Users có thể xóa project |
| permissions.can_add_member | Array[ObjectId] | Users có thể thêm thành viên |
| member_count | Number | Số lượng thành viên, tính toán tự động |
| created_at | Timestamp | Thời điểm tạo project, có index |
| updated_at | Timestamp | Thời điểm cập nhật gần nhất |
| _destroy | Boolean | Đánh dấu xóa mềm (false: hoạt động, true: đã xóa) |
## ✅ 4. Tasks Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của task |
| title | String | Tiêu đề task, có index để tìm kiếm |
| description | String | Mô tả chi tiết công việc, tùy chọn |
| status | String | Trạng thái (enum: ["todo", "in_progress", "testing", "completed"]) |
| priority | String | Độ ưu tiên (enum: ["low", "medium", "high"]) |
| project_id | ObjectId | Project chứa task, tham chiếu Projects, có index |
| created_by | ObjectId | User tạo task, tham chiếu Users |
| due_date | Date | Hạn hoàn thành, có index để query, tùy chọn |
| completed_at | Timestamp | Thời điểm hoàn thành thực tế, tùy chọn |
| assignees | Array[Object] | Danh sách người được giao |
| assignees.user_id | ObjectId | User được giao task, tham chiếu Users |
| assignees.role_id | ObjectId | Vai trò trong task, tham chiếu Roles |
| assignees.assigned_by | ObjectId | User giao task, tham chiếu Users |
| assignees.assigned_at | Timestamp | Thời điểm giao task |
| tags | Array[String] | Nhãn phân loại (bug, feature, urgent...), tùy chọn |
| reminders | Array[Object] | Lời nhắc tự động |
| reminders.time | Date | Thời điểm nhắc |
| reminders.type | String | Loại nhắc (enum: ["email", "popup", "push", "sms"]) |
| reminders.method | String | Phương thức cụ thể, tùy chọn |
| reminders.created_by | ObjectId | User tạo reminder, tham chiếu Users |
| reminders.created_at | Timestamp | Thời điểm tạo reminder |
| permissions | Object | Quyền hạn với task |
| permissions.can_edit | Array[ObjectId] | Users có thể chỉnh sửa task |
| permissions.can_delete | Array[ObjectId] | Users có thể xóa task |
| permissions.can_assign | Array[ObjectId] | Users có thể giao task |
| created_at | Timestamp | Thời điểm tạo task, có index |
| updated_at | Timestamp | Thời điểm cập nhật gần nhất |
| _destroy | Boolean | Đánh dấu xóa mềm (false: hoạt động, true: đã xóa) |

## 💬 5. Messages Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của tin nhắn |
| conversation_id | ObjectId | Cuộc trò chuyện chứa tin nhắn, tham chiếu Conversations |
| sender_id | ObjectId | User gửi tin nhắn, tham chiếu Users |
| content | String | Nội dung tin nhắn |
| is_read | Boolean | Đã đọc hay chưa, dùng cho thông báo |
| created_at | Timestamp | Thời điểm gửi, có index để sắp xếp |
| _destroy | Boolean | Đánh dấu xóa mềm (false: hoạt động, true: đã xóa) |
## 👥 6. Conversations Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của cuộc trò chuyện |
| type | String | Loại chat (enum: ["direct", "group"]) |
| name | String | Tên cuộc trò chuyện (tùy chọn, dùng cho group) |
| members | Array[ObjectId] | Danh sách thành viên, tham chiếu Users |
| created_by | ObjectId | User tạo cuộc trò chuyện, tham chiếu Users |
| created_at | Timestamp | Thời điểm tạo, có index |
| updated_at | Timestamp | Thời điểm hoạt động gần nhất |
| _destroy | Boolean | Đánh dấu xóa mềm (false: hoạt động, true: đã xóa) |
## 📇 7. ChatContacts Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của mối quan hệ |
| user_id | ObjectId | User chủ sở hữu danh bạ, có index |
| contact_id | ObjectId | User được thêm vào danh bạ, tham chiếu Users |
| added_at | Timestamp | Thời điểm thêm liên hệ |
| _destroy | Boolean | Đánh dấu xóa mềm (false: hoạt động, true: đã xóa) |
## 🔔 8. Notifications Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của thông báo |
| user_id | ObjectId | User nhận thông báo, có index, tham chiếu Users |
| type | String | Loại thông báo (enum: ["task_assigned", "task_due_soon", "task_completed", "project_invite", "mention", "message", "comment", "custom"]) |
| title | String | Tiêu đề thông báo |
| content | String | Nội dung chi tiết |
| link | String | URL frontend để điều hướng khi click, tùy chọn |
| related_id | ObjectId | ID đối tượng liên quan (task, project...), tùy chọn |
| read | Boolean | Đã đọc hay chưa |
| scheduled_for | Timestamp | Thời điểm hiển thị (cho thông báo hẹn giờ), tùy chọn |
| created_at | Timestamp | Thời điểm tạo thông báo, có index |
| updated_at | Timestamp | Thời điểm cập nhật gần nhất |
| _destroy | Boolean | Đánh dấu xóa mềm (false: hoạt động, true: đã xóa) |
## 🌍 9. Enums Collection

| Field | Kiểu dữ liệu | Tác dụng |
|-------|-------------|----------|
| _id | ObjectId | ID duy nhất của enum |
| type | String | Loại enum (enum: ["status", "priority", "role", "tag"]) |
| key | String | Khóa enum (planning, high, admin...) |
| translations | Object | Bản dịch đa ngôn ngữ |
| translations.vi | String | Bản dịch tiếng Việt |
| translations.en | String | Bản dịch tiếng Anh |
| translations.jp | String | Bản dịch tiếng Nhật |
| translations.fr | String | Bản dịch tiếng Pháp |
| created_at | Timestamp | Thời điểm tạo enum |
| updated_at | Timestamp | Thời điểm cập nhật gần nhất |
## 🔍 Lưu ý về Index

Các field có index để tối ưu hiệu suất truy vấn:

- **Users:** username, email, created_at
- **Projects:** name, created_at
- **Tasks:** title, project_id, due_date, created_at
- **Messages:** created_at
- **Conversations:** created_at
- **ChatContacts:** user_id
- **Notifications:** user_id, created_at

## 🗑️ Xóa mềm (Soft Delete)

Tất cả collection đều có field `_destroy` để thực hiện xóa mềm:

- **false:** Bản ghi đang hoạt động
- **true:** Bản ghi đã bị xóa nhưng vẫn lưu trong DB để audit

## Tóm tắt thay đổi:

1. Xóa các trường không còn trong schema (isActive, veryfyTocken trong Users)
2. Đồng bộ mô tả và kiểu dữ liệu với schema mới nhất
3. Bổ sung chi tiết cho Notifications và Enums
4. Đảm bảo tính nhất quán trong cách trình bày và mô tả tác dụng của các field