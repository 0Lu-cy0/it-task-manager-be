Dưới đây là toàn bộ MongoDB schema đầy đủ và cập nhật mới nhất, đã bao gồm collection Notifications, cùng với tất cả các cải tiến bạn đã yêu cầu trước đó:

### Users

```js
{
  _id: ObjectId (required),
  username: String (required, unique, indexed),
  email: String (required, unique, indexed),
  full_name: String (required),
  role_id: ObjectId (required), // references Roles
  avatar_url: String <Default: null>,
  phone: String <Default: null>,
  department: String <Default: null>,
  language: String <Default: "en"> // enum: ["vi", "en", "jp", "fr"]
  contacts: Array of ObjectId <Default: []>, // references Users
  created_at: Timestamp <Default: Date.now>,
  updated_at: Timestamp <Default: Date.now>,
  _destroy: Boolean <Default: false>
}
```

### Roles

```js
{
  _id: ObjectId (required),
  name: String (required, unique), // e.g. "admin", "developer"
  permissions: Array of String, // e.g. ["create_project", "view_task"]
  description: String <Default: null>,
  created_at: Timestamp <Default: Date.now>,
  _destroy: Boolean <Default: false>
}
```

### Projects

```js
{
  _id: ObjectId (required),
  name: String (required, indexed),
  description: String <Default: null>,
  status: String (required), // enum: ["planning", "in_progress", "testing", "completed"]
  priority: String (required), // enum: ["low", "medium", "high"]
  progress: Number <Default: 0>,
  start_date: Date <Default: null>,
  end_date: Date <Default: null>,
  created_by: ObjectId (required), // references Users
  team_lead: ObjectId <Default: null>, // references Users
  deputy_lead: ObjectId <Default: null>, // references Users
  members: Array of {
    user_id: ObjectId, // references Users
    role_id: ObjectId, // references Roles
    joined_at: Timestamp <Default: Date.now>
  } <Default: []>,
  permissions: {
    can_edit: Array of ObjectId <Default: []>,
    can_delete: Array of ObjectId <Default: []>,
    can_add_member: Array of ObjectId <Default: []>
  },
  member_count: Number <Default: 0>,
  created_at: Timestamp <Default: Date.now>,
  updated_at: Timestamp <Default: Date.now>,
  _destroy: Boolean <Default: false>
}
```

### Tasks

```js
{
  _id: ObjectId (required),
  title: String (required, indexed),
  description: String <Default: null>,
  status: String (required), // enum: ["todo", "in_progress", "testing", "completed"]
  priority: String (required), // enum: ["low", "medium", "high"]
  project_id: ObjectId (required), // references Projects
  created_by: ObjectId (required), // references Users
  due_date: Date <Default: null>,
  completed_at: Timestamp <Default: null>,
  assignees: Array of {
    user_id: ObjectId, // references Users
    role_id: ObjectId, // references Roles
    assigned_by: ObjectId, // references Users
    assigned_at: Timestamp <Default: Date.now>
  } <Default: []>,
  tags: Array of String <Default: []>,
  reminders: Array of {
    time: Date,
    type: String <Default: "popup">, // enum: ["email", "popup", "push", "sms"]
    method: String <Optional>,
    created_by: ObjectId,
    created_at: Timestamp <Default: Date.now>
  } <Default: []>,
  permissions: {
    can_edit: Array of ObjectId <Default: []>,
    can_delete: Array of ObjectId <Default: []>,
    can_assign: Array of ObjectId <Default: []>
  },
  created_at: Timestamp <Default: Date.now>,
  updated_at: Timestamp <Default: Date.now>,
  _destroy: Boolean <Default: false>
}
```

### Messages

```js
{
  _id: ObjectId (required),
  conversation_id: ObjectId, // references Conversations
  sender_id: ObjectId (required), // references Users
  content: String (required),
  is_read: Boolean <Default: false>,
  created_at: Timestamp <Default: Date.now>,
  _destroy: Boolean <Default: false>
}
```

### Conversations

```js
{
  _id: ObjectId (required),
  type: String (required), // enum: ["direct", "group"]
  name: String <Default: null>,
  members: Array of ObjectId, // references Users
  created_by: ObjectId (required), // references Users
  created_at: Timestamp <Default: Date.now>,
  updated_at: Timestamp <Default: Date.now>,
  _destroy: Boolean <Default: false>
}
```

### ChatContacts

```js
{
  _id: ObjectId (required),
  user_id: ObjectId (required), // references Users
  contact_id: ObjectId (required), // references Users
  added_at: Timestamp <Default: Date.now>,
  _destroy: Boolean <Default: false>
}
```

### Notifications

```js
{
  _id: ObjectId (required),
  user_id: ObjectId (required), // references Users
  type: String (required), // enum: ["task_assigned", "task_due_soon", "task_completed", "project_invite", "mention", "message", "comment", "custom"]
  title: String (required),
  content: String (required),
  link: String <Optional>, // frontend URL (e.g. /projects/123/tasks/456)
  related_id: ObjectId <Optional>,
  read: Boolean <Default: false>,
  scheduled_for: Timestamp <Optional>,
  created_at: Timestamp <Default: Date.now>,
  updated_at: Timestamp <Default: Date.now>,
  _destroy: Boolean <Default: false>
}
```

### Enums

```js
{
  _id: ObjectId (required),
  type: String (required), // enum: ["status", "priority", "role", "tag"]
  key: String (required), // e.g. "planning", "high"
  translations: {
    vi: String,
    en: String,
    jp: String,
    fr: String
  },
  created_at: Timestamp <Default: Date.now>,
  updated_at: Timestamp <Default: Date.now>
}
```

<!-- 🧭 Tóm tắt
Collection	Đã cập nhật	Ghi chú
Users	✅	Thêm contacts, language, role_id
Roles	✅	Quản lý phân quyền tập trung
Projects	✅	Thêm members nhúng, permissions, progress
Tasks	✅	Thêm tags, reminders, permissions, assignees
Messages	✅	Kết nối với Conversations
Conversations	✅	Phân biệt direct/group chat
ChatContacts	✅	Gọn nhẹ, có thể merge hoặc tách tùy use-case
Notifications	✅ Mới	Quản lý thông báo hệ thống & cá nhân
Enums	✅	Hỗ trợ đa ngôn ngữ, enum mở rộng dễ cấu hình -->
