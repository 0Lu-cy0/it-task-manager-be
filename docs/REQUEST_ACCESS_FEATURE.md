# 🎯 Request Access Feature - Giống Trello

## 📋 Tổng quan

Tính năng cho phép user **request access** vào **private project** mà không cần invite link. Admin sẽ nhận notification và approve/reject.

**Giống Trello:** Khi bạn tìm thấy private board, bạn có thể "Request to Join", admin sẽ xét duyệt.

---

## 🔄 Flow

```
User → Tìm thấy Private Project
    → Click "Request Access" (có thể kèm message)
    → Admin nhận notification
    → Admin Approve → User join project
    → Admin Reject → User không join (nhận notification kèm lý do)
```

---

## 🆕 API Endpoints

### 1. **Request Access** (User)

**POST** `/home/access-requests/:projectId/request`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body (Optional):**
```json
{
  "message": "Xin chào! Tôi muốn tham gia dự án này để học hỏi."
}
```

**Response Success (201):**
```json
{
  "message": "Đã gửi yêu cầu truy cập. Admin sẽ xem xét yêu cầu của bạn.",
  "request": {
    "_id": "6123456789abcdef01234567",
    "project_id": "6123456789abcdef01234567",
    "status": "pending",
    "created_at": "2025-11-13T..."
  }
}
```

**Errors:**
- `400`: "Dự án công khai. Bạn có thể tham gia trực tiếp mà không cần request."
- `400`: "Bạn đã là thành viên của dự án này"
- `400`: "Bạn đã gửi yêu cầu truy cập cho dự án này"
- `404`: "Dự án không tồn tại"

---

### 2. **Get Project Requests** (Admin)

**GET** `/home/access-requests/:projectId/requests?status=pending`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Params:**
- `status` (optional): `pending`, `approved`, `rejected`

**Response Success (200):**
```json
{
  "message": "Danh sách yêu cầu truy cập",
  "requests": [
    {
      "_id": "6123456789abcdef01234567",
      "user": {
        "_id": "...",
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "avatar": "https://..."
      },
      "message": "Xin chào! Tôi muốn tham gia...",
      "status": "pending",
      "reviewed_by": null,
      "reviewed_at": null,
      "reject_reason": null,
      "created_at": "2025-11-13T..."
    }
  ]
}
```

---

### 3. **Approve Request** (Admin)

**POST** `/home/access-requests/requests/:requestId/approve`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body (Optional):**
```json
{
  "roleId": "6123456789abcdef01234567"
}
```

**Response Success (200):**
```json
{
  "message": "Đã chấp nhận yêu cầu truy cập",
  "request": {
    "_id": "...",
    "user": {
      "_id": "...",
      "name": "Nguyễn Văn A"
    },
    "project": {
      "_id": "...",
      "name": "Project ABC"
    },
    "status": "approved"
  }
}
```

**Errors:**
- `404`: "Yêu cầu không tồn tại hoặc đã được xử lý"
- `403`: "Bạn không phải thành viên của dự án này"
- `400`: "User đã là thành viên của dự án"

---

### 4. **Reject Request** (Admin)

**POST** `/home/access-requests/requests/:requestId/reject`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Body (Optional):**
```json
{
  "reason": "Dự án này hiện tại chỉ dành cho nhân viên nội bộ."
}
```

**Response Success (200):**
```json
{
  "message": "Đã từ chối yêu cầu truy cập"
}
```

---

### 5. **Get User Requests** (User)

**GET** `/home/access-requests/my-requests`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response Success (200):**
```json
{
  "message": "Danh sách yêu cầu truy cập của bạn",
  "requests": [
    {
      "_id": "...",
      "project": {
        "_id": "...",
        "name": "Project ABC",
        "description": "..."
      },
      "message": "Xin chào!...",
      "status": "approved",
      "reviewed_by": {
        "name": "Admin Name"
      },
      "reviewed_at": "2025-11-13T...",
      "reject_reason": null,
      "created_at": "2025-11-13T..."
    }
  ]
}
```

---

## 🎨 Frontend Implementation

### Component: ProjectCard

```jsx
const ProjectCard = ({ project, user }) => {
  const [hasRequested, setHasRequested] = useState(false);
  
  // Check if user has pending request
  useEffect(() => {
    const checkRequest = async () => {
      const requests = await fetchUserRequests();
      const pending = requests.find(
        r => r.project._id === project._id && r.status === 'pending'
      );
      setHasRequested(!!pending);
    };
    checkRequest();
  }, [project._id]);
  
  const handleRequestAccess = async () => {
    const message = prompt('Message cho admin (optional):');
    await requestAccess(project._id, message);
    setHasRequested(true);
    toast.success('Đã gửi yêu cầu!');
  };
  
  if (project.visibility === 'private') {
    if (hasRequested) {
      return (
        <Badge color="yellow">
          ⏳ Chờ admin duyệt
        </Badge>
      );
    }
    
    return (
      <Button onClick={handleRequestAccess}>
        🔒 Request Access
      </Button>
    );
  }
  
  // Public project
  return <Button onClick={joinPublic}>Join Now</Button>;
};
```

### Component: Admin Dashboard

```jsx
const AccessRequestsPanel = ({ projectId }) => {
  const [requests, setRequests] = useState([]);
  
  useEffect(() => {
    fetchProjectRequests(projectId, 'pending').then(setRequests);
  }, [projectId]);
  
  const handleApprove = async (requestId, roleId) => {
    await approveRequest(requestId, roleId);
    toast.success('Đã chấp nhận!');
    // Refresh list
    fetchProjectRequests(projectId, 'pending').then(setRequests);
  };
  
  const handleReject = async (requestId) => {
    const reason = prompt('Lý do từ chối (optional):');
    await rejectRequest(requestId, reason);
    toast.success('Đã từ chối!');
    // Refresh list
    fetchProjectRequests(projectId, 'pending').then(setRequests);
  };
  
  return (
    <div>
      <h3>Pending Access Requests ({requests.length})</h3>
      {requests.map(req => (
        <Card key={req._id}>
          <Avatar src={req.user.avatar} />
          <div>
            <strong>{req.user.name}</strong>
            <p>{req.message}</p>
            <small>{formatDate(req.created_at)}</small>
          </div>
          <ButtonGroup>
            <Button onClick={() => handleApprove(req._id)}>
              ✓ Approve
            </Button>
            <Button onClick={() => handleReject(req._id)}>
              ✗ Reject
            </Button>
          </ButtonGroup>
        </Card>
      ))}
    </div>
  );
};
```

---

## 🔔 Notifications

### 1. Admin nhận notification khi có request mới
```json
{
  "type": "custom",
  "title": "Yêu cầu truy cập mới",
  "content": "Nguyễn Văn A muốn tham gia dự án 'Project ABC'",
  "link": "/projects/123/access-requests"
}
```

### 2. User nhận notification khi được approve
```json
{
  "type": "custom",
  "title": "Yêu cầu truy cập được chấp nhận",
  "content": "Yêu cầu tham gia dự án 'Project ABC' của bạn đã được chấp nhận",
  "link": "/projects/123"
}
```

### 3. User nhận notification khi bị reject
```json
{
  "type": "custom",
  "title": "Yêu cầu truy cập bị từ chối",
  "content": "Yêu cầu tham gia dự án 'Project ABC' bị từ chối. Lý do: Dự án hiện tại chỉ dành cho nhân viên nội bộ."
}
```

---

## 📊 Database Schema

### Collection: `access_requests`

```javascript
{
  _id: ObjectId,
  project_id: ObjectId (ref: 'projects'),
  user_id: ObjectId (ref: 'users'),
  message: String (optional, max 500 chars),
  status: String (enum: ['pending', 'approved', 'rejected']),
  reviewed_by: ObjectId (ref: 'users', nullable),
  reviewed_at: Date (nullable),
  reject_reason: String (optional, max 200 chars),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ project_id: 1, user_id: 1, status: 1 }` - Unique for pending
- `{ project_id: 1 }` - Query by project
- `{ user_id: 1 }` - Query by user
- `{ status: 1 }` - Filter by status

---

## 🎯 Use Cases

### Use Case 1: User request vào private project
```
1. User tìm thấy private project "Internal Tools"
2. Click "Request Access"
3. Nhập message: "I'm from Marketing team"
4. Submit
5. Admin nhận notification
```

### Use Case 2: Admin approve request
```
1. Admin vào tab "Access Requests"
2. Thấy request từ user A
3. Đọc message
4. Click "Approve" với role "viewer"
5. User A nhận notification
6. User A tự động là member với role viewer
```

### Use Case 3: Admin reject request với reason
```
1. Admin xem request
2. Click "Reject"
3. Nhập lý do: "Project này chỉ dành cho team Dev"
4. Submit
5. User nhận notification kèm lý do
```

---

## 🧪 Test Cases

### Test 1: Request access vào private project ✅
```bash
POST /access-requests/PRIVATE_PROJECT_ID/request
Body: {"message": "Hello!"}
Expected: 201 Created
```

### Test 2: Request access vào public project ❌
```bash
POST /access-requests/PUBLIC_PROJECT_ID/request
Expected: 400 Bad Request
Message: "Dự án công khai. Bạn có thể tham gia trực tiếp..."
```

### Test 3: Request 2 lần cho cùng project ❌
```bash
POST /access-requests/PROJECT_ID/request
(lần 2)
Expected: 400 Bad Request
Message: "Bạn đã gửi yêu cầu truy cập..."
```

### Test 4: Admin approve request ✅
```bash
POST /access-requests/requests/REQUEST_ID/approve
Body: {"roleId": "VIEWER_ROLE_ID"}
Expected: 200 OK
→ User becomes member
```

### Test 5: Non-admin approve request ❌
```bash
POST /access-requests/requests/REQUEST_ID/approve
(user không phải admin)
Expected: 403 Forbidden
```

---

## 🔄 So sánh với Trello

| Feature | Trello | Your System |
|---------|--------|-------------|
| **Request Access** | ✅ | ✅ |
| **Admin Approve/Reject** | ✅ | ✅ |
| **Message khi request** | ✅ | ✅ |
| **Reject reason** | ❌ | ✅ (Better!) |
| **Notification** | ✅ | ✅ |
| **Pending requests list** | ✅ | ✅ |
| **Request history** | ✅ | ✅ |

---

## 💡 Best Practices

### Cho User:
1. **Viết message rõ ràng** khi request access
2. **Chờ admin duyệt**, không spam request
3. **Check status** trong "My Requests"

### Cho Admin:
1. **Review requests thường xuyên** để user không phải chờ lâu
2. **Viết lý do** khi reject để user hiểu
3. **Assign role phù hợp** khi approve

### Cho Frontend:
1. **Badge hiển thị số pending requests** cho admin
2. **Disable button** nếu đã request (tránh spam)
3. **Show status** của request (pending/approved/rejected)

---

## 🎉 Summary

Giờ hệ thống của bạn đã **GIỐNG TRELLO**:

✅ Email Invite  
✅ Permanent Link  
✅ Public Join  
✅ **Request Access** ⭐ NEW  
✅ Accept/Reject  
✅ Notifications  
✅ Role Management  

**Hoàn chỉnh 100% như Trello rồi! 🚀**
