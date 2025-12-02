# IT Task Manager API Documentation

**Base URL:** `http://localhost:8181`

**Author:** Cat2004

**Version:** 1.0.0

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Projects](#projects)
3. [Tasks](#tasks)
4. [Invites](#invites)
5. [Notifications](#notifications)
6. [Project Roles](#project-roles)
7. [Dashboard](#dashboard)
8. [Search](#search)

---

## 🔐 Authentication

### 1. Register New User

**Endpoint:** `POST /auth/register`

**Rate Limit:** 10 requests per 15 minutes

**Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+84912345678",
  "department": "Engineering"
}
```

**Response (201 Created):**

```json
{
  "message": "Đăng ký thành công",
  "data": {
    "_id": "65abc123def456789",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": null,
    "phone": "+84912345678",
    "department": "Engineering",
    "language": "vi",
    "is_verified": false,
    "createdAt": "2025-10-22T10:30:00.000Z",
    "updatedAt": "2025-10-22T10:30:00.000Z"
  }
}
```

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "_id": "65abc123def456789",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": null,
      "phone": "+84912345678",
      "department": "Engineering"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Authentication:** Required (Bearer Token)

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Response (200 OK):**

```json
{
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "_id": "65abc123def456789",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "phone": "+84912345678",
    "department": "Engineering",
    "language": "vi",
    "is_verified": true
  }
}
```

---

### 4. Update Profile

**Endpoint:** `PUT /auth/me`

**Authentication:** Required

**Request Body:**

```json
{
  "full_name": "John Smith",
  "phone": "+84987654321",
  "department": "Product",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "language": "en"
}
```

**Response (200 OK):**

```json
{
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "_id": "65abc123def456789",
    "email": "user@example.com",
    "full_name": "John Smith",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "phone": "+84987654321",
    "department": "Product",
    "language": "en"
  }
}
```

---

### 5. Change Password

**Endpoint:** `PUT /auth/me/password`

**Authentication:** Required

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response (200 OK):**

```json
{
  "message": "Đổi mật khẩu thành công"
}
```

---

### 6. Request Reset Password

**Endpoint:** `POST /auth/reset-password/request`

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "message": "Email đặt lại mật khẩu đã được gửi"
}
```

---

### 7. Confirm Reset Password

**Endpoint:** `POST /auth/reset-password/confirm`

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**

```json
{
  "message": "Đặt lại mật khẩu thành công"
}
```

---

### 8. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 9. Logout

**Endpoint:** `POST /auth/logout`

**Authentication:** Required

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Đăng xuất thành công"
}
```

---

## 📁 Projects

### 1. Create New Project

**Endpoint:** `POST /home/projects`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "planning",
  "priority": "high",
  "start_date": "2025-10-22T00:00:00.000Z",
  "end_date": "2025-12-31T23:59:59.999Z"
}
```

**Field Validations:**

- `name`: required, 5-50 characters
- `status`: enum ['planning', 'in_progress', 'testing', 'completed']
- `priority`: enum ['low', 'medium', 'high']
- `end_date`: must be after `start_date`

**Response (201 Created):**

```json
{
  "status": "success",
  "message": "Dự án đã được tạo thành công",
  "data": {
    "_id": "65abc123def456789",
    "name": "New Project",
    "description": "Project description",
    "status": "planning",
    "priority": "high",
    "start_date": "2025-10-22T00:00:00.000Z",
    "end_date": "2025-12-31T23:59:59.999Z",
    "created_by": "65abc123def456789",
    "members": [],
    "member_count": 0,
    "last_activity": "2025-10-22T10:30:00.000Z",
    "free_mode": false,
    "createdAt": "2025-10-22T10:30:00.000Z",
    "updatedAt": "2025-10-22T10:30:00.000Z"
  }
}
```

---

### 2. Get All Projects

**Endpoint:** `GET /home/projects`

**Authentication:** Required

**Query Parameters:**

- `status` (optional): filter by status
- `priority` (optional): filter by priority
- `page` (optional): page number (default: 1)
- `limit` (optional): items per page (default: 10)

**Example:** `GET /home/projects?status=in_progress&priority=high&page=1&limit=10`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Danh sách dự án được lấy thành công",
  "data": {
    "projects": [
      {
        "_id": "65abc123def456789",
        "name": "Project A",
        "description": "Description A",
        "status": "in_progress",
        "priority": "high",
        "start_date": "2025-10-01T00:00:00.000Z",
        "end_date": "2025-12-31T23:59:59.999Z",
        "created_by": {
          "_id": "65abc123def456789",
          "full_name": "John Doe",
          "email": "john@example.com"
        },
        "members": [
          {
            "user_id": {
              "_id": "65abc123def456789",
              "full_name": "John Doe",
              "email": "john@example.com"
            },
            "project_role_id": {
              "_id": "65abc123def456789",
              "name": "owner"
            },
            "joined_at": "2025-10-01T00:00:00.000Z"
          }
        ],
        "member_count": 3,
        "last_activity": "2025-10-22T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### 3. Get Project By ID

**Endpoint:** `GET /home/projects/:projectId`

**Authentication:** Required

**Permission:** `view_project`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Dự án được lấy thành công",
  "data": {
    "_id": "65abc123def456789",
    "name": "Project A",
    "description": "Description A",
    "status": "in_progress",
    "priority": "high",
    "start_date": "2025-10-01T00:00:00.000Z",
    "end_date": "2025-12-31T23:59:59.999Z",
    "created_by": {
      "_id": "65abc123def456789",
      "full_name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "members": [
      {
        "user_id": {
          "_id": "65abc123def456789",
          "full_name": "John Doe",
          "email": "john@example.com",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "project_role_id": {
          "_id": "65abc123def456789",
          "name": "owner",
          "permissions": ["view_project", "edit_project", "delete_project"]
        },
        "joined_at": "2025-10-01T00:00:00.000Z"
      }
    ],
    "member_count": 3,
    "tasks": [
      {
        "_id": "65abc123def456789",
        "title": "Task 1",
        "status": "in_progress",
        "priority": "high"
      }
    ]
  }
}
```

---

### 4. Update Project

**Endpoint:** `PUT /home/projects/:projectId`

**Authentication:** Required

**Permission:** `edit_project`

**Request Body:**

```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "end_date": "2026-01-31T23:59:59.999Z"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Dự án đã được cập nhật",
  "data": {
    "_id": "65abc123def456789",
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "in_progress",
    "priority": "medium",
    "end_date": "2026-01-31T23:59:59.999Z",
    "updatedAt": "2025-10-22T10:35:00.000Z"
  }
}
```

---

### 5. Delete Project (Soft Delete)

**Endpoint:** `DELETE /home/projects/:projectId`

**Authentication:** Required

**Permission:** `delete_project`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Dự án đã được xóa"
}
```

---

### 6. Remove Member from Project

**Endpoint:** `DELETE /home/projects/:projectId/members/:userId`

**Authentication:** Required

**Permission:** `can_add_member`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Thành viên đã được xóa khỏi dự án"
}
```

---

### 7. Update Member Role

**Endpoint:** `PUT /home/projects/:projectId/roles`

**Authentication:** Required

**Permission:** `change_member_role`

**Request Body:**

```json
{
  "members": [
    {
      "user_id": "65abc123def456789",
      "project_role_id": "65abc123def456789"
    },
    {
      "user_id": "65abc123def456790",
      "project_role_id": "65abc123def456790"
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Vai trò thành viên đã được cập nhật",
  "data": {
    "updated": [
      {
        "user_id": "65abc123def456789",
        "project_role_id": "65abc123def456789",
        "role_name": "lead"
      }
    ]
  }
}
```

---

### 8. Get Project Roles

**Endpoint:** `GET /home/projects/:projectId/roles`

**Authentication:** Required

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "65abc123def456789",
      "name": "owner",
      "description": "Project owner with full permissions",
      "permissions": ["view_project", "edit_project", "delete_project", "add_member"]
    },
    {
      "_id": "65abc123def456790",
      "name": "lead",
      "description": "Project lead",
      "permissions": ["view_project", "edit_project", "add_member"]
    },
    {
      "_id": "65abc123def456791",
      "name": "member",
      "description": "Project member",
      "permissions": ["view_project", "view_task"]
    }
  ]
}
```

---

### 9. Toggle Free Mode

**Endpoint:** `PATCH /home/projects/:projectId/free-mode`

**Authentication:** Required

**Permission:** Owner only

**Description:** Enable/disable free mode for custom permissions

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Free mode đã được bật/tắt",
  "data": {
    "free_mode": true
  }
}
```

---

## ✅ Tasks

### 1. Get All Tasks

**Endpoint:** `GET /home/tasks`

**Authentication:** Required

**Query Parameters:**

- `project_id` (optional): filter by project
- `status` (optional): filter by status ['todo', 'in_progress', 'testing', 'completed']
- `priority` (optional): filter by priority ['low', 'medium', 'high']
- `assignees` (optional): filter by assignee user ID

**Example:** `GET /home/tasks?project_id=65abc123def456789&status=in_progress&priority=high`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "65abc123def456789",
      "title": "Implement login feature",
      "description": "Add JWT authentication",
      "status": "in_progress",
      "priority": "high",
      "project_id": {
        "_id": "65abc123def456789",
        "name": "Project A"
      },
      "created_by": {
        "_id": "65abc123def456789",
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "due_date": "2025-10-30T23:59:59.999Z",
      "completed_at": null,
      "assignees": [
        {
          "user_id": {
            "_id": "65abc123def456789",
            "full_name": "John Doe",
            "email": "john@example.com"
          },
          "role_id": "65abc123def456789",
          "assigned_by": {
            "_id": "65abc123def456790",
            "full_name": "Jane Smith"
          },
          "assigned_at": "2025-10-22T10:00:00.000Z"
        }
      ],
      "tags": ["backend", "authentication"],
      "createdAt": "2025-10-22T09:00:00.000Z",
      "updatedAt": "2025-10-22T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Task By ID

**Endpoint:** `GET /home/tasks/:projectId/:id`

**Authentication:** Required

**Permission:** `view_task`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "_id": "65abc123def456789",
    "title": "Implement login feature",
    "description": "Add JWT authentication with refresh token support",
    "status": "in_progress",
    "priority": "high",
    "project_id": {
      "_id": "65abc123def456789",
      "name": "Project A",
      "description": "Main project"
    },
    "created_by": {
      "_id": "65abc123def456789",
      "full_name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "due_date": "2025-10-30T23:59:59.999Z",
    "completed_at": null,
    "assignees": [
      {
        "user_id": {
          "_id": "65abc123def456789",
          "full_name": "John Doe",
          "email": "john@example.com",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "role_id": "65abc123def456789",
        "assigned_by": {
          "_id": "65abc123def456790",
          "full_name": "Jane Smith"
        },
        "assigned_at": "2025-10-22T10:00:00.000Z"
      }
    ],
    "tags": ["backend", "authentication", "security"],
    "reminders": [
      {
        "time": "2025-10-29T09:00:00.000Z",
        "type": "email",
        "method": "email",
        "created_by": "65abc123def456789",
        "created_at": "2025-10-22T10:00:00.000Z"
      }
    ],
    "createdAt": "2025-10-22T09:00:00.000Z",
    "updatedAt": "2025-10-22T10:30:00.000Z"
  }
}
```

---

### 3. Create Task

**Endpoint:** `POST /home/tasks/:projectId`

**Authentication:** Required

**Permission:** `create_task`

**Request Body:**

```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-10-30T23:59:59.999Z",
  "tags": ["backend", "feature"],
  "reminders": [
    {
      "time": "2025-10-29T09:00:00.000Z",
      "type": "email",
      "method": "email"
    }
  ]
}
```

**Field Validations:**

- `title`: required, string
- `status`: enum ['todo', 'in_progress', 'testing', 'completed']
- `priority`: enum ['low', 'medium', 'high']

**Response (201 Created):**

```json
{
  "status": "success",
  "message": "Task created successfully",
  "data": {
    "_id": "65abc123def456789",
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "priority": "high",
    "project_id": "65abc123def456789",
    "created_by": "65abc123def456789",
    "due_date": "2025-10-30T23:59:59.999Z",
    "assignees": [],
    "tags": ["backend", "feature"],
    "reminders": [
      {
        "time": "2025-10-29T09:00:00.000Z",
        "type": "email",
        "method": "email",
        "created_by": "65abc123def456789",
        "created_at": "2025-10-22T10:30:00.000Z"
      }
    ],
    "createdAt": "2025-10-22T10:30:00.000Z",
    "updatedAt": "2025-10-22T10:30:00.000Z"
  }
}
```

---

### 4. Update Task

**Endpoint:** `PUT /home/tasks/:projectId/:id`

**Authentication:** Required

**Permission:** `edit_task`

**Request Body:**

```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "due_date": "2025-11-15T23:59:59.999Z",
  "tags": ["backend", "feature", "urgent"]
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Task updated successfully",
  "data": {
    "_id": "65abc123def456789",
    "title": "Updated Task Title",
    "description": "Updated description",
    "status": "in_progress",
    "priority": "medium",
    "due_date": "2025-11-15T23:59:59.999Z",
    "tags": ["backend", "feature", "urgent"],
    "updatedAt": "2025-10-22T11:00:00.000Z"
  }
}
```

---

### 5. Delete Task

**Endpoint:** `DELETE /home/tasks/:projectId/:id`

**Authentication:** Required

**Permission:** `delete_task`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Task deleted successfully"
}
```

---

### 6. Assign Task

**Endpoint:** `POST /home/tasks/:projectId/:id/assign`

**Authentication:** Required

**Permission:** `assign_task`

**Request Body:**

```json
{
  "user_id": "65abc123def456789",
  "role_id": "65abc123def456789"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Task assigned successfully",
  "data": {
    "_id": "65abc123def456789",
    "assignees": [
      {
        "user_id": {
          "_id": "65abc123def456789",
          "full_name": "John Doe",
          "email": "john@example.com"
        },
        "role_id": "65abc123def456789",
        "assigned_by": {
          "_id": "65abc123def456790",
          "full_name": "Jane Smith"
        },
        "assigned_at": "2025-10-22T11:00:00.000Z"
      }
    ]
  }
}
```

---

### 7. Unassign Task

**Endpoint:** `POST /home/tasks/:projectId/:id/unassign`

**Authentication:** Required

**Permission:** `unassign_task`

**Request Body:**

```json
{
  "user_id": "65abc123def456789"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Task unassigned successfully",
  "data": {
    "_id": "65abc123def456789",
    "assignees": []
  }
}
```

---

### 8. Update Task Status

**Endpoint:** `PATCH /home/tasks/:projectId/:id/status`

**Authentication:** Required

**Permission:** `status_task`

**Request Body:**

```json
{
  "status": "completed"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Task status updated successfully",
  "data": {
    "_id": "65abc123def456789",
    "status": "completed",
    "completed_at": "2025-10-22T11:30:00.000Z",
    "updatedAt": "2025-10-22T11:30:00.000Z"
  }
}
```

---

## 📧 Invites

### 1. Create Invite Link

**Endpoint:** `POST /home/invites/:projectId/inviteLink`

**Authentication:** Required

**Permission:** `add_member`

**Rate Limit:** 5 requests per hour

**Request Body:**

```json
{
  "role_id": "65abc123def456789",
  "expires_at": "2025-10-30T23:59:59.999Z",
  "max_uses": 10
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "message": "Invite link created successfully",
  "data": {
    "_id": "65abc123def456789",
    "project_id": "65abc123def456789",
    "token": "unique_invite_token_abc123",
    "role_id": "65abc123def456789",
    "created_by": "65abc123def456789",
    "expires_at": "2025-10-30T23:59:59.999Z",
    "max_uses": 10,
    "current_uses": 0,
    "invite_link": "http://localhost:8181/home/invites/unique_invite_token_abc123",
    "createdAt": "2025-10-22T11:00:00.000Z"
  }
}
```

---

### 2. Handle Invite Link (Accept Invite)

**Endpoint:** `GET /home/invites/:token`

**Authentication:** Required

**Description:** User clicks invite link to join project

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "You have successfully joined the project",
  "data": {
    "project": {
      "_id": "65abc123def456789",
      "name": "Project A",
      "description": "Project description"
    },
    "role": {
      "_id": "65abc123def456789",
      "name": "member"
    },
    "joined_at": "2025-10-22T11:30:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request:** Invalid or expired token
- **400 Bad Request:** Maximum uses reached
- **400 Bad Request:** User already member of project

---

## 🔔 Notifications

### 1. Get All Notifications

**Endpoint:** `GET /home/notifications`

**Authentication:** Required

**Query Parameters:**

- `page` (optional): page number (default: 1)
- `limit` (optional): items per page (default: 20)
- `is_read` (optional): filter by read status (true/false)

**Example:** `GET /home/notifications?page=1&limit=20&is_read=false`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "_id": "65abc123def456789",
        "user_id": "65abc123def456789",
        "type": "task_assigned",
        "title": "New task assigned",
        "message": "You have been assigned to task: Implement login feature",
        "data": {
          "task_id": "65abc123def456789",
          "project_id": "65abc123def456789",
          "assigned_by": "65abc123def456790"
        },
        "is_read": false,
        "read_at": null,
        "createdAt": "2025-10-22T11:00:00.000Z"
      },
      {
        "_id": "65abc123def456790",
        "user_id": "65abc123def456789",
        "type": "project_invite",
        "title": "Project invitation",
        "message": "You have been invited to join Project B",
        "data": {
          "project_id": "65abc123def456790",
          "invited_by": "65abc123def456791"
        },
        "is_read": true,
        "read_at": "2025-10-22T11:30:00.000Z",
        "createdAt": "2025-10-22T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    }
  }
}
```

---

### 2. Get Notification Detail

**Endpoint:** `GET /home/notifications/:notiId`

**Authentication:** Required

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "_id": "65abc123def456789",
    "user_id": "65abc123def456789",
    "type": "task_assigned",
    "title": "New task assigned",
    "message": "You have been assigned to task: Implement login feature",
    "data": {
      "task_id": "65abc123def456789",
      "task_title": "Implement login feature",
      "project_id": "65abc123def456789",
      "project_name": "Project A",
      "assigned_by": {
        "_id": "65abc123def456790",
        "full_name": "Jane Smith",
        "email": "jane@example.com"
      }
    },
    "is_read": false,
    "read_at": null,
    "createdAt": "2025-10-22T11:00:00.000Z"
  }
}
```

---

### 3. Mark Notification as Read

**Endpoint:** `PATCH /home/notifications/:notiId`

**Authentication:** Required

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Notification marked as read",
  "data": {
    "_id": "65abc123def456789",
    "is_read": true,
    "read_at": "2025-10-22T12:00:00.000Z"
  }
}
```

---

### 4. Delete Notification

**Endpoint:** `DELETE /home/notifications/:notiId`

**Authentication:** Required

**Description:** Delete a single read notification

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Notification deleted successfully"
}
```

---

### 5. Delete All Read Notifications

**Endpoint:** `DELETE /home/notifications`

**Authentication:** Required

**Description:** Delete all read notifications for current user

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "All read notifications deleted successfully",
  "data": {
    "deleted_count": 15
  }
}
```

---

## 👥 Project Roles

### 1. Add Permission to Role

**Endpoint:** `POST /home/project-roles/:projectId/roles/:roleId/permissions`

**Authentication:** Required

**Permission:** `edit_permission_role`

**Rate Limit:** 100 requests per 15 minutes

**Request Body:**

```json
{
  "permission_id": "65abc123def456789"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Permission added to role successfully",
  "data": {
    "role_id": "65abc123def456789",
    "role_name": "lead",
    "permissions": [
      {
        "_id": "65abc123def456789",
        "name": "view_project",
        "description": "View project details"
      },
      {
        "_id": "65abc123def456790",
        "name": "edit_project",
        "description": "Edit project information"
      }
    ]
  }
}
```

---

### 2. Remove Permission from Role

**Endpoint:** `DELETE /home/project-roles/:projectId/roles/:roleId/permissions/:permissionId`

**Authentication:** Required

**Permission:** `edit_permission_role`

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Permission removed from role successfully",
  "data": {
    "role_id": "65abc123def456789",
    "role_name": "lead",
    "permissions": [
      {
        "_id": "65abc123def456789",
        "name": "view_project",
        "description": "View project details"
      }
    ]
  }
}
```

---

### 3. Get Role Permissions

**Endpoint:** `GET /home/project-roles/:projectId/roles/:roleId/permissions`

**Authentication:** Required

**Permission:** `view_project`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "role": {
      "_id": "65abc123def456789",
      "name": "lead",
      "description": "Project lead with elevated permissions",
      "project_id": "65abc123def456789"
    },
    "permissions": [
      {
        "_id": "65abc123def456789",
        "name": "view_project",
        "description": "View project details",
        "category": "project"
      },
      {
        "_id": "65abc123def456790",
        "name": "edit_project",
        "description": "Edit project information",
        "category": "project"
      },
      {
        "_id": "65abc123def456791",
        "name": "create_task",
        "description": "Create new tasks",
        "category": "task"
      },
      {
        "_id": "65abc123def456792",
        "name": "assign_task",
        "description": "Assign tasks to members",
        "category": "task"
      }
    ]
  }
}
```

---

## 📊 Dashboard

### 1. Get Dashboard Overview

**Endpoint:** `GET /home/dashboard`

**Authentication:** Required

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "65abc123def456789",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "statistics": {
      "total_projects": 15,
      "active_projects": 8,
      "completed_projects": 7,
      "total_tasks": 87,
      "pending_tasks": 23,
      "in_progress_tasks": 34,
      "completed_tasks": 30,
      "overdue_tasks": 5
    },
    "recent_activity": [
      {
        "type": "task_completed",
        "description": "Completed task: Implement login feature",
        "timestamp": "2025-10-22T11:30:00.000Z",
        "task_id": "65abc123def456789",
        "project_id": "65abc123def456789"
      },
      {
        "type": "project_created",
        "description": "Created new project: Project C",
        "timestamp": "2025-10-22T10:00:00.000Z",
        "project_id": "65abc123def456790"
      }
    ],
    "upcoming_deadlines": [
      {
        "task_id": "65abc123def456789",
        "task_title": "Deploy to production",
        "project_name": "Project A",
        "due_date": "2025-10-25T23:59:59.999Z",
        "days_remaining": 3
      },
      {
        "task_id": "65abc123def456790",
        "task_title": "Code review",
        "project_name": "Project B",
        "due_date": "2025-10-26T23:59:59.999Z",
        "days_remaining": 4
      }
    ]
  }
}
```

---

### 2. Get Recent Projects

**Endpoint:** `GET /home/dashboard/recent`

**Authentication:** Required

**Description:** Get projects with activity in the last 3 days

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "65abc123def456789",
      "name": "Project A",
      "description": "Main project",
      "status": "in_progress",
      "priority": "high",
      "last_activity": "2025-10-22T11:30:00.000Z",
      "member_count": 5,
      "task_statistics": {
        "total": 25,
        "completed": 10,
        "in_progress": 12,
        "todo": 3
      }
    },
    {
      "_id": "65abc123def456790",
      "name": "Project B",
      "description": "Secondary project",
      "status": "in_progress",
      "priority": "medium",
      "last_activity": "2025-10-21T15:00:00.000Z",
      "member_count": 3,
      "task_statistics": {
        "total": 15,
        "completed": 8,
        "in_progress": 5,
        "todo": 2
      }
    }
  ]
}
```

---

## 🔍 Search

### 1. Global Search

**Endpoint:** `GET /home/search/search`

**Authentication:** Required

**Query Parameters:**

- `q` (required): search query string
- `type` (optional): filter by type ['projects', 'tasks', 'users']
- `limit` (optional): max results per type (default: 10)

**Example:** `GET /home/search/search?q=login&type=tasks&limit=5`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "query": "login",
    "results": {
      "projects": [
        {
          "_id": "65abc123def456789",
          "name": "Authentication Project",
          "description": "Implement login and signup features",
          "status": "in_progress",
          "relevance_score": 0.95
        }
      ],
      "tasks": [
        {
          "_id": "65abc123def456789",
          "title": "Implement login feature",
          "description": "Add JWT authentication",
          "project_name": "Project A",
          "status": "in_progress",
          "priority": "high",
          "relevance_score": 0.98
        },
        {
          "_id": "65abc123def456790",
          "title": "Test login flow",
          "description": "Write unit tests for login",
          "project_name": "Project A",
          "status": "todo",
          "priority": "medium",
          "relevance_score": 0.85
        }
      ],
      "users": [
        {
          "_id": "65abc123def456789",
          "full_name": "John Login",
          "email": "john.login@example.com",
          "department": "Engineering",
          "relevance_score": 0.75
        }
      ]
    },
    "total_results": {
      "projects": 1,
      "tasks": 2,
      "users": 1
    }
  }
}
```

---

### 2. Search Projects

**Endpoint:** `GET /home/search/search/projects`

**Authentication:** Required

**Query Parameters:**

- `q` (required): search query
- `status` (optional): filter by status
- `priority` (optional): filter by priority
- `limit` (optional): max results (default: 20)

**Example:** `GET /home/search/search/projects?q=backend&status=in_progress&limit=10`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "65abc123def456789",
      "name": "Backend API Project",
      "description": "REST API development",
      "status": "in_progress",
      "priority": "high",
      "member_count": 5,
      "created_by": {
        "_id": "65abc123def456789",
        "full_name": "John Doe"
      },
      "last_activity": "2025-10-22T11:30:00.000Z",
      "relevance_score": 0.92
    }
  ]
}
```

---

### 3. Search Tasks

**Endpoint:** `GET /home/search/search/tasks`

**Authentication:** Required

**Query Parameters:**

- `q` (required): search query
- `project_id` (optional): filter by project
- `status` (optional): filter by status
- `priority` (optional): filter by priority
- `assignees` (optional): filter by assignee
- `limit` (optional): max results (default: 20)

**Example:** `GET /home/search/search/tasks?q=authentication&status=in_progress&priority=high`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "65abc123def456789",
      "title": "Implement JWT authentication",
      "description": "Add token-based authentication with refresh tokens",
      "status": "in_progress",
      "priority": "high",
      "project": {
        "_id": "65abc123def456789",
        "name": "Project A"
      },
      "created_by": {
        "_id": "65abc123def456789",
        "full_name": "John Doe"
      },
      "assignees": [
        {
          "user_id": {
            "_id": "65abc123def456789",
            "full_name": "John Doe"
          }
        }
      ],
      "due_date": "2025-10-30T23:59:59.999Z",
      "relevance_score": 0.96
    }
  ]
}
```

---

### 4. Search Users

**Endpoint:** `GET /home/search/search/users`

**Authentication:** Required

**Query Parameters:**

- `q` (required): search query (name or email)
- `department` (optional): filter by department
- `limit` (optional): max results (default: 20)

**Example:** `GET /home/search/search/users?q=john&department=Engineering`

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "65abc123def456789",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "avatar_url": "https://example.com/avatar.jpg",
      "department": "Engineering",
      "phone": "+84912345678",
      "relevance_score": 0.88
    },
    {
      "_id": "65abc123def456790",
      "full_name": "John Smith",
      "email": "john.smith@example.com",
      "avatar_url": "https://example.com/avatar2.jpg",
      "department": "Engineering",
      "phone": "+84987654321",
      "relevance_score": 0.85
    }
  ]
}
```

---

## ⚠️ Error Responses

All endpoints return standard error responses in the following format:

### 400 Bad Request

```json
{
  "status": "error",
  "message": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Unauthorized - Invalid or missing token"
}
```

### 403 Forbidden

```json
{
  "status": "error",
  "message": "Forbidden - You don't have permission to perform this action"
}
```

### 404 Not Found

```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 429 Too Many Requests

```json
{
  "status": "error",
  "message": "Too many requests, please try again later"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "message": "Internal server error",
  "error": "Error details (only in development mode)"
}
```

---

## 🔑 Authentication Headers

Most endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

---

## 📝 Common Field Enums

### Project Status

- `planning`
- `in_progress`
- `testing`
- `completed`

### Project Priority

- `low`
- `medium`
- `high`

### Task Status

- `todo`
- `in_progress`
- `testing`
- `completed`

### Task Priority

- `low`
- `medium`
- `high`

### User Language

- `vi` (Vietnamese)
- `en` (English)
- `jp` (Japanese)
- `fr` (French)

### Notification Types

- `task_assigned`
- `task_completed`
- `task_overdue`
- `project_invite`
- `project_updated`
- `member_added`
- `member_removed`
- `role_changed`

### Reminder Types

- `email`
- `popup`
- `push`
- `sms`

---

## 🛠️ Permissions

### Project Permissions

- `view_project` - View project details
- `edit_project` - Edit project information
- `delete_project` - Delete project
- `add_member` - Add members to project
- `remove_member` - Remove members from project
- `change_member_role` - Change member roles
- `edit_permission_role` - Edit role permissions
- `toggle_free_mode` - Toggle free mode (owner only)

### Task Permissions

- `view_task` - View task details
- `create_task` - Create new tasks
- `edit_task` - Edit task information
- `delete_task` - Delete tasks
- `assign_task` - Assign tasks to members
- `unassign_task` - Unassign tasks from members
- `status_task` - Update task status

---

## 📚 Additional Notes

1. **Pagination:** Most list endpoints support pagination with `page` and `limit` query parameters
2. **Soft Delete:** Projects and tasks use soft delete (`_destroy: true`) instead of hard delete
3. **Timestamps:** All resources include `createdAt` and `updatedAt` timestamps
4. **Rate Limiting:** Some endpoints have rate limiting to prevent abuse
5. **CORS:** API supports CORS for allowed domains configured in `.env`
6. **MeiliSearch:** Search endpoints use MeiliSearch for fast full-text search
7. **MongoDB:** All data is stored in MongoDB with Mongoose ODM

---

## 🔗 API Documentation UI

Interactive API documentation is available at:

```
http://localhost:8181/api-docs
```

Swagger JSON specification:

```
http://localhost:8181/swagger.json
```

---

**Last Updated:** October 22, 2025

**Contact:** nc12042004@gmail.com
