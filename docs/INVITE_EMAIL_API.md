# 📧 Hệ thống gửi lời mời qua Email

## Tổng quan

Hệ thống cho phép gửi lời mời tham gia dự án qua email. Người nhận sẽ:
1. Nhận email với nút Accept/Reject
2. Nếu đã có tài khoản, sẽ nhận thông báo trong hệ thống
3. Có thể chấp nhận hoặc từ chối lời mời

---

## 🔗 API Endpoints

### 1. Gửi lời mời qua email

**POST** `/home/invites/:projectId/send-email`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Params:**
- `projectId` (ObjectId) - ID của dự án

**Body:**
```json
{
  "email": "user@example.com",
  "roleId": "6123456789abcdef01234567"
}
```

**Response Success (201):**
```json
{
  "message": "Đã gửi lời mời qua email",
  "invite": {
    "_id": "6123456789abcdef01234567",
    "email": "user@example.com",
    "project_id": "6123456789abcdef01234567",
    "status": "pending",
    "expires_at": "2025-11-20T00:00:00.000Z"
  }
}
```

**Lưu ý:**
- Người gửi phải có quyền `add_member` trong project
- Email không được trùng với các lời mời đang pending
- Lời mời có hiệu lực 7 ngày

---

### 2. Lấy danh sách lời mời của user

**GET** `/home/invites/my-invites`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Response Success (200):**
```json
{
  "message": "Danh sách lời mời",
  "invites": [
    {
      "_id": "6123456789abcdef01234567",
      "project": {
        "_id": "6123456789abcdef01234567",
        "name": "Dự án ABC",
        "description": "Mô tả dự án"
      },
      "invited_by": {
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com"
      },
      "role": "member",
      "created_at": "2025-11-13T00:00:00.000Z",
      "expires_at": "2025-11-20T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Chấp nhận lời mời

**POST** `/home/invites/:inviteId/accept`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Params:**
- `inviteId` (ObjectId) - ID của lời mời

**Response Success (200):**
```json
{
  "message": "Đã chấp nhận lời mời",
  "project": {
    "_id": "6123456789abcdef01234567",
    "name": "Dự án ABC"
  }
}
```

**Lưu ý:**
- User phải đăng nhập với email được mời
- Lời mời phải còn hiệu lực (chưa hết hạn)
- User chưa là thành viên của dự án

---

### 4. Từ chối lời mời

**POST** `/home/invites/:inviteId/reject`

**Headers:**
```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Params:**
- `inviteId` (ObjectId) - ID của lời mời

**Response Success (200):**
```json
{
  "message": "Đã từ chối lời mời"
}
```

---

## 📬 Email Template

Email gửi đi sẽ có định dạng:

```
🎉 Lời mời tham gia dự án

Xin chào,

[Tên người mời] đã mời bạn tham gia dự án [Tên dự án].

[Nút Chấp nhận]  [Nút Từ chối]

Lời mời này sẽ hết hạn sau 7 ngày.
```

---

## 🔔 Thông báo (Notifications)

Hệ thống sẽ tự động tạo thông báo trong các trường hợp:

### 1. Khi gửi lời mời
- **Người nhận:** User được mời (nếu đã có tài khoản)
- **Type:** `invite_created`
- **Nội dung:** "[Người mời] đã mời bạn tham gia dự án [Tên dự án]"

### 2. Khi chấp nhận lời mời
- **Người nhận:** Người đã gửi lời mời
- **Type:** `invite_accepted`
- **Nội dung:** "[Người nhận] đã chấp nhận lời mời tham gia dự án [Tên dự án]"

### 3. Khi từ chối lời mời
- **Người nhận:** Người đã gửi lời mời
- **Type:** `invite_rejected`
- **Nội dung:** "[Người nhận] đã từ chối lời mời tham gia dự án [Tên dự án]"

---

## 🎨 Frontend Integration

### 1. Gửi lời mời
```javascript
const sendInvite = async (projectId, email, roleId) => {
  try {
    const response = await fetch(`/home/invites/${projectId}/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, roleId })
    });
    
    const data = await response.json();
    console.log('Invite sent:', data);
  } catch (error) {
    console.error('Error sending invite:', error);
  }
};
```

### 2. Hiển thị danh sách lời mời
```javascript
const fetchMyInvites = async () => {
  try {
    const response = await fetch('/home/invites/my-invites', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    console.log('My invites:', data.invites);
  } catch (error) {
    console.error('Error fetching invites:', error);
  }
};
```

### 3. Chấp nhận lời mời
```javascript
const acceptInvite = async (inviteId) => {
  try {
    const response = await fetch(`/home/invites/${inviteId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    console.log('Invite accepted:', data);
    // Redirect to project page
    window.location.href = `/projects/${data.project._id}`;
  } catch (error) {
    console.error('Error accepting invite:', error);
  }
};
```

### 4. Từ chối lời mời
```javascript
const rejectInvite = async (inviteId) => {
  try {
    const response = await fetch(`/home/invites/${inviteId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    console.log('Invite rejected:', data);
  } catch (error) {
    console.error('Error rejecting invite:', error);
  }
};
```

---

## 🔐 Bảo mật

1. **Authentication**: Tất cả API đều yêu cầu JWT token
2. **Authorization**: 
   - Gửi lời mời: Cần quyền `add_member`
   - Accept/Reject: Chỉ user được mời mới được thực hiện
3. **Validation**: Email và RoleId được validate nghiêm ngặt
4. **Expiration**: Lời mời tự động hết hạn sau 7 ngày

---

## ⚠️ Error Codes

| Status | Message | Giải thích |
|--------|---------|------------|
| 400 | Email này đã được mời vào dự án | Đã có lời mời pending cho email này |
| 400 | Bạn đã là thành viên của dự án này | User đã tham gia dự án |
| 400 | Lời mời đã hết hạn | Lời mời quá 7 ngày |
| 401 | Unauthorized | Chưa đăng nhập |
| 403 | Bạn không có quyền mời người dùng | Thiếu quyền `add_member` |
| 403 | Bạn không có quyền chấp nhận lời mời này | Email không khớp |
| 404 | Dự án không tồn tại | Project ID không hợp lệ |
| 404 | Lời mời không tồn tại | Invite ID không hợp lệ hoặc đã xử lý |

---

## 📊 Database Schema

### Invite Model
```javascript
{
  _id: ObjectId,
  project_id: ObjectId (ref: 'projects'),
  email: String (lowercase, indexed),
  invite_token: String (nullable),
  invited_by: ObjectId (ref: 'users'),
  status: String (enum: ['pending', 'accepted', 'rejected', 'expired']),
  role_id: ObjectId (ref: 'project_roles'),
  expires_at: Date,
  is_permanent: Boolean,
  created_at: Date,
  updated_at: Date
}
```

---

## 🧪 Testing

### Test Case 1: Gửi lời mời thành công
```bash
POST /home/invites/6123456789abcdef01234567/send-email
Body: {
  "email": "test@example.com",
  "roleId": "6123456789abcdef01234567"
}
Expected: 201 Created
```

### Test Case 2: Chấp nhận lời mời
```bash
POST /home/invites/6123456789abcdef01234567/accept
Expected: 200 OK
```

### Test Case 3: Email đã được mời
```bash
POST /home/invites/6123456789abcdef01234567/send-email
Body: { "email": "test@example.com", "roleId": "..." }
Expected: 400 Bad Request - "Email này đã được mời vào dự án"
```

---

## 🔄 Flow Chart

```
1. User A gửi lời mời cho email@example.com
   ↓
2. Hệ thống tạo invite record (status: pending)
   ↓
3. Gửi email với link accept/reject
   ↓
4. Nếu user đã có tài khoản → Tạo notification
   ↓
5. User B nhận email và đăng nhập
   ↓
6. User B xem danh sách lời mời (GET /my-invites)
   ↓
7a. User B Accept → Thêm vào project, status: accepted
7b. User B Reject → status: rejected
   ↓
8. Tạo notification cho User A
```

---

## 📝 Notes

- Lời mời chỉ gửi được cho email chưa được mời (pending)
- User có thể có nhiều lời mời từ các project khác nhau
- Permanent invite link vẫn hoạt động song song với email invite
- Email được gửi qua Gmail SMTP (cấu hình trong .env)

---

## 🚀 Deployment Checklist

- [ ] Cập nhật `EMAIL_USER` và `EMAIL_PASS` trong .env
- [ ] Cập nhật `CLIENT_URL` để link accept/reject chính xác
- [ ] Test gửi email trong môi trường development
- [ ] Kiểm tra spam folder nếu email không đến
- [ ] Cấu hình rate limiting cho API gửi email
- [ ] Monitor số lượng email gửi đi (Gmail limit: 500/day)
