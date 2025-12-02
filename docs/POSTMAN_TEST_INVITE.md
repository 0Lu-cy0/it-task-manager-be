# 🧪 Test Invite APIs với Postman

## 📋 Chuẩn bị

### 1. **Base URL**
```
http://localhost:8181
```

### 2. **Lấy Access Token**
Trước tiên cần đăng nhập để lấy token:

**POST** `http://localhost:8181/auth/login`

**Body (JSON):**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "_id": "6123456789abcdef01234567",
    "email": "your-email@example.com"
  }
}
```

**⚠️ Lưu `accessToken` để dùng cho các request tiếp theo!**

---

## 🧪 Test Cases

### ✅ Test 1: Gửi lời mời qua email

**POST** `http://localhost:8181/home/invites/:projectId/send-email`

**Thay `:projectId` bằng ID project thực tế của bạn**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "roleId": "6123456789abcdef01234567"
}
```

**Expected Response (201 Created):**
```json
{
  "message": "Đã gửi lời mời qua email",
  "invite": {
    "_id": "6123456789abcdef01234567",
    "email": "test@example.com",
    "project_id": "6123456789abcdef01234567",
    "status": "pending",
    "expires_at": "2025-11-20T00:00:00.000Z"
  }
}
```

**📝 Lưu ý:**
- Cần có quyền `add_member` trong project
- Phải thay `projectId` và `roleId` bằng ID thật trong database của bạn

---

### ✅ Test 2: Lấy danh sách lời mời của mình

**GET** `http://localhost:8181/home/invites/my-invites`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** (Không cần)

**Expected Response (200 OK):**
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

### ✅ Test 3: Chấp nhận lời mời

**POST** `http://localhost:8181/home/invites/:inviteId/accept`

**Thay `:inviteId` bằng ID của lời mời (lấy từ Test 2)**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** (Không cần)

**Expected Response (200 OK):**
```json
{
  "message": "Đã chấp nhận lời mời",
  "project": {
    "_id": "6123456789abcdef01234567",
    "name": "Dự án ABC"
  }
}
```

---

### ✅ Test 4: Từ chối lời mời

**POST** `http://localhost:8181/home/invites/:inviteId/reject`

**Thay `:inviteId` bằng ID của lời mời**

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** (Không cần)

**Expected Response (200 OK):**
```json
{
  "message": "Đã từ chối lời mời"
}
```

---

### ✅ Test 5: Lấy permanent invite link

**GET** `http://localhost:8181/home/invites/:projectId/permanent`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200 OK):**
```json
{
  "message": "Link lời mời vĩnh viễn",
  "invite": {
    "_id": "6123456789abcdef01234567",
    "project_id": "6123456789abcdef01234567",
    "invite_link": "http://localhost:5173/api/invites/abc123token456",
    "invite_token": "abc123token456",
    "status": "pending",
    "role_id": "6123456789abcdef01234567",
    "is_permanent": true
  }
}
```

---

## 🎯 Quy trình test đầy đủ

### Scenario: User A mời User B vào project

#### Bước 1: User A đăng nhập
```
POST /auth/login
Body: { "email": "userA@example.com", "password": "123456" }
→ Lưu tokenA
```

#### Bước 2: User A gửi lời mời cho User B
```
POST /home/invites/PROJECT_ID/send-email
Headers: Authorization: Bearer {tokenA}
Body: { "email": "userB@example.com", "roleId": "ROLE_ID" }
→ Lưu inviteId
```

#### Bước 3: User B đăng nhập
```
POST /auth/login
Body: { "email": "userB@example.com", "password": "123456" }
→ Lưu tokenB
```

#### Bước 4: User B xem lời mời
```
GET /home/invites/my-invites
Headers: Authorization: Bearer {tokenB}
→ Thấy lời mời từ User A
```

#### Bước 5a: User B chấp nhận
```
POST /home/invites/INVITE_ID/accept
Headers: Authorization: Bearer {tokenB}
→ User B được thêm vào project
```

HOẶC

#### Bước 5b: User B từ chối
```
POST /home/invites/INVITE_ID/reject
Headers: Authorization: Bearer {tokenB}
→ Lời mời bị reject
```

---

## 🛠️ Setup Postman Collection

### Cách 1: Import Collection sẵn có
Bạn có file collection này không?
```
docs/It task manager API.postman_collection.json
```

Nếu có → Import vào Postman

### Cách 2: Tạo Environment

1. Click **Environments** trong Postman
2. Create New Environment: `IT Task Manager - Local`
3. Thêm variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| baseUrl | http://localhost:8181 | http://localhost:8181 |
| accessToken | (empty) | (để trống, sẽ set sau khi login) |
| projectId | (empty) | (ID project của bạn) |
| roleId | (empty) | (ID role của bạn) |
| inviteId | (empty) | (ID invite để test) |

4. Save Environment

### Cách 3: Sử dụng Variables trong Postman

**URL:** `{{baseUrl}}/home/invites/{{projectId}}/send-email`

**Headers:** `Authorization: Bearer {{accessToken}}`

---

## 📌 Lấy Project ID và Role ID

### Lấy Project ID
**GET** `http://localhost:8181/home/projects`

Headers: `Authorization: Bearer {token}`

Response sẽ có list projects, copy `_id` của project bạn muốn test.

### Lấy Role ID
**GET** `http://localhost:8181/home/project-roles?projectId={PROJECT_ID}`

Headers: `Authorization: Bearer {token}`

Response sẽ có list roles (viewer, member, admin), copy `_id` của role.

---

## ⚠️ Common Errors

### 1. 401 Unauthorized
```json
{ "message": "Unauthorized" }
```
**Fix:** Kiểm tra token đã được thêm vào Headers chưa

### 2. 403 Forbidden
```json
{ "message": "Bạn không có quyền mời người dùng vào dự án này" }
```
**Fix:** User phải có quyền `add_member` trong project

### 3. 400 Bad Request - Email đã được mời
```json
{ "message": "Email này đã được mời vào dự án" }
```
**Fix:** Dùng email khác hoặc xóa invite cũ trong database

### 4. 404 Not Found - Project không tồn tại
```json
{ "message": "Dự án không tồn tại" }
```
**Fix:** Kiểm tra lại `projectId` có đúng không

### 5. 422 Unprocessable Entity - Validation Error
```json
{ "message": "Email không hợp lệ" }
```
**Fix:** Kiểm tra format email và roleId

---

## 📧 Test Email (Optional)

Sau khi gửi lời mời thành công, kiểm tra email:

1. Mở inbox của `test@example.com`
2. Tìm email từ `nc12042004@gmail.com`
3. Click nút "Chấp nhận" hoặc "Từ chối"
4. Sẽ redirect tới `http://localhost:5173/invites/{inviteId}/accept`

**⚠️ Lưu ý:** Frontend phải xử lý route này!

---

## 🎨 Postman Tests Scripts

Thêm vào tab **Tests** để auto-save variables:

### Script cho Login
```javascript
// Lưu token sau khi login
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.accessToken);
    console.log("✅ Token saved:", response.accessToken);
}
```

### Script cho Send Invite
```javascript
// Lưu invite ID
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("inviteId", response.invite._id);
    console.log("✅ Invite ID saved:", response.invite._id);
}
```

---

## 🔍 Debug Tips

1. **Console Log:** Xem tab **Console** trong Postman để debug
2. **Response Time:** Check xem API có chậm không
3. **Status Code:** Luôn kiểm tra status code trước khi xem body
4. **Headers:** Đảm bảo `Content-Type: application/json`

---

## ✅ Checklist

- [ ] Server đang chạy (`yarn dev`)
- [ ] Đã login và có access token
- [ ] Đã có project ID và role ID
- [ ] Email config đúng trong .env
- [ ] Database có data để test
- [ ] Postman đã setup environment

**Happy Testing! 🚀**
