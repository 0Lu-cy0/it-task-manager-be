# Task Management Module Summary

## 🗂️ Files Structure

### Created/Modified Files
- `src/controllers/taskController.js` - Task CRUD and management operations
- `src/routes/home/taskRoute.js` - Task route definitions
- `src/services/taskService.js` - Task business logic
- `src/models/taskModel.js` - Task data model
- `src/validations/taskValidation.js` - Task input validation schemas

## 🛣️ API Endpoints

### Task CRUD Operations
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/home/tasks` | Create a new task | Required |
| PUT | `/home/tasks/:id` | Update task details | Required |
| DELETE | `/home/tasks/:id` | Delete a task | Required |
| GET | `/home/tasks/:id` | Get task by ID | Required |
| GET | `/home/tasks` | Get tasks with filters | Required |

### Task Management
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/home/tasks/:id/assign` | Assign task to user | Required |
| PATCH | `/home/tasks/:id/status` | Update task status | Required |

### Query Parameters for GET /tasks
- `project_id`: Filter tasks by project
- `status`: Filter by task status
- `priority`: Filter by priority level
- `assignee`: Filter by assigned user

## 🔐 Middleware

### Authentication
- `authMiddleware.verifyToken` - Applied to all task routes
- Validates JWT token
- Adds user information to request object

### Error Handling
- Central error handling middleware
- Handles validation errors
- Handles database errors
- Returns standardized error responses

## 💾 Data Model

### Task Schema
```javascript
{
  title: String (required, indexed),
  description: String,
  status: String (enum: ['todo', 'in_progress', 'testing', 'completed']),
  priority: String (enum: ['low', 'medium', 'high']),
  project_id: ObjectId (required, ref: 'projects'),
  created_by: ObjectId (required, ref: 'users'),
  due_date: Date,
  completed_at: Date,
  assignees: [{
    user_id: ObjectId (ref: 'users'),
    role_id: ObjectId (ref: 'roles'),
    assigned_by: ObjectId (ref: 'users'),
    assigned_at: Date
  }],
  tags: [String],
  permissions: {
    can_edit: [ObjectId],
    can_delete: [ObjectId],
    can_assign: [ObjectId]
  },
  created_at: Date,
  updated_at: Date,
  _destroy: Boolean
}
```

## 🔄 Response Format

### Success Response
```javascript
{
  status: 'success',
  message: 'Operation specific message',
  data: {
    // Response data
  }
}
```

### Error Response
```javascript
{
  status: 'fail',
  message: 'Error message'
}
```

## 🔍 Validation

### Create Task
- Title: Required, 3-200 characters
- Project ID: Required
- Priority: Required (low/medium/high)
- Status: Optional (defaults to 'todo')
- Due Date: Optional

### Update Task
- Title: 3-200 characters
- Priority: low/medium/high
- Description: Optional
- Due Date: Optional
- Tags: Array of strings

### Task Assignment
- User ID: Required
- Role ID: Required

### Status Update
- Status: Required (todo/in_progress/testing/completed)
