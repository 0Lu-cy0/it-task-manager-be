# Dashboard Summary Enhancements

## New APIs

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/home/dashboards/projects/:projectId/summary` | Returns stats, status/priority breakdowns, and types of work for a project. | `rangeDays` (default 7), `dueInDays` (default 7), `typeLimit` (default 4) |
| GET | `/home/dashboards/projects/:projectId/workload` | Aggregates task distribution per assignee plus unassigned load. | `limit` (default 10) |
| GET | `/home/dashboards/projects/:projectId/activity` | Streams recent server logs for the project dashboard activity feed. | `limit` (default 20) |

## Response Outline

### GET `/projects/:projectId/summary`
```json
{
  "message": "Lấy dữ liệu tổng quan thành công",
  "data": {
    "project": { "_id": "...", "name": "CRM" },
    "range": { "days": 7, "since": "2025-08-01T00:00:00Z", "until": "2025-08-08T00:00:00Z" },
    "dueSoon": { "days": 7, "start": "2025-08-08T00:00:00Z", "end": "2025-08-15T00:00:00Z" },
    "stats": { "created": 3, "updated": 5, "completed": 1, "dueSoon": 2 },
    "statusOverview": {
      "total": 12,
      "breakdown": [{ "key": "in_progress", "label": "In progress", "count": 6, "percentage": 50 }]
    },
    "priorityBreakdown": [{ "key": "high", "label": "High", "count": 4, "percentage": 33.33 }],
    "typesOfWork": [{ "key": "task", "label": "Task", "count": 8, "percentage": 66.67 }]
  }
}
```

### GET `/projects/:projectId/workload`
```json
{
  "message": "Lấy workload thành viên thành công",
  "data": {
    "project": { "_id": "...", "name": "CRM" },
    "totals": { "tasks": 12, "assignments": 11 },
    "members": [
      {
        "user_id": "687e691163c97f56d69be594",
        "full_name": "Developer User",
        "tasks": 6,
        "percentage": 54.55
      }
    ],
    "unassigned": { "tasks": 2, "percentage": 18.18 }
  }
}
```

### GET `/projects/:projectId/activity`
```json
{
  "message": "Lấy activity feed thành công",
  "data": {
    "project": { "_id": "...", "name": "CRM" },
    "logs": [
      {
        "_id": "66f...",
        "content": "User admin created task \"Implement Login\"",
        "logHistory": "{\"taskId\":\"...\",\"type\":\"task_created\"}",
        "user": { "full_name": "Admin User", "email": "admin@example.com" },
        "createdAt": "2025-08-08T10:00:00Z"
      }
    ]
  }
}
```

> All routes require authentication and will validate that the requester is a project member unless the project is public.
