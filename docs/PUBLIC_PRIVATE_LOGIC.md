# 🔐 Logic Public/Private cho Hệ thống Invite

## 📊 Tổng quan

Project có 2 loại **visibility**:
- **`private`**: Chỉ thành viên được mời mới có thể tham gia
- **`public`**: Bất kỳ ai cũng có thể tham gia

---

## 🎯 Logic chi tiết

### 1️⃣ **PRIVATE Project**

#### ✅ Cách tham gia:
- **Cách 1:** Nhận email invite → Accept
- **Cách 2:** Click vào permanent invite link (nếu có)

#### 🚫 Hạn chế:
- Không thể tự join
- Phải có invite token hợp lệ
- Phải được admin/lead mời

#### API Flow:
```
Admin → Send Invite Email → User nhận email
                          → User Accept/Reject
                          → Thêm vào project (nếu Accept)
```

---

### 2️⃣ **PUBLIC Project** ✨ UPDATED

#### ✅ Cách tham gia:
- **Cách 1:** Tự join trực tiếp → Role: **Viewer** ⭐
- **Cách 2:** Accept invite email → Role: **Theo invite** 🎯
- **Cách 3:** Click permanent invite link → Role: **Viewer**

#### � Tại sao vẫn cho phép gửi invite cho public project?

**Use Cases hợp lý:**
1. **Assign role cụ thể:** Mời với role "member" thay vì "viewer" mặc định
2. **Notification/Marketing:** Thông báo có dự án mới
3. **Track invitations:** Thống kê ai mời ai, growth metrics
4. **Personalized onboarding:** Gửi email hướng dẫn cá nhân hóa

#### API Flow:
```
// Cách 1: Direct Join (Viewer)
User → POST /invites/:projectId/join-public → Viewer role

// Cách 2: Invite Email (Custom Role)
Admin → Send Invite với role "member"
      → User Accept
      → Member role (not viewer!)
```

---

## 🔄 Ma trận Logic (Updated ✨)

| Tính năng | Private Project | Public Project |
|-----------|----------------|----------------|
| **Gửi Email Invite** | ✅ Cho phép | ✅ Cho phép (notification purpose) |
| **Accept Invite** | ✅ Bắt buộc để join | ✅ Optional (để nhận role trong invite) |
| **Reject Invite** | ✅ Cho phép | ✅ Cho phép |
| **Permanent Link** | ✅ Cho phép | ✅ Cho phép |
| **Join Public** | ❌ Không cho phép | ✅ Cho phép (auto viewer) |
| **Role khi join** | Theo invite | Invite: theo invite, Direct join: viewer |

---

## 🆕 API mới: Join Public Project

### **POST** `/home/invites/:projectId/join-public`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response Success (200):**
```json
{
  "message": "Đã tham gia dự án công khai",
  "project": {
    "_id": "6123456789abcdef01234567",
    "name": "Open Source Project",
    "visibility": "public"
  }
}
```

**Response Error (403) - Private Project:**
```json
{
  "message": "Dự án này là private. Bạn cần được mời để tham gia."
}
```

**Response Error (400) - Already Member:**
```json
{
  "message": "Bạn đã là thành viên của dự án này"
}
```

---

## 🛡️ Validation Errors ✨ UPDATED

### 1. Gửi invite cho public project ✅ ALLOWED NOW
```
POST /invites/:projectId/send-email (public project)
→ 201 Created
→ "Đã gửi lời mời qua email. Lưu ý: Đây là dự án công khai, người nhận có thể tham gia trực tiếp."
```

### 2. Accept invite của public project ✅ ALLOWED NOW
```
POST /invites/:inviteId/accept (public project)
→ 200 OK
→ "Đã chấp nhận lời mời và tham gia dự án công khai"
→ User nhận được role trong invite (không phải viewer mặc định)
```

### 3. Join private project ❌ ERROR
```
POST /invites/:projectId/join-public (private project)
→ 403 Forbidden
→ "Dự án này là private. Bạn cần được mời để tham gia."
```

---

## 📋 Use Cases

### Use Case 1: Admin mời user vào private project
```javascript
// ✅ Allowed
POST /home/invites/PRIVATE_PROJECT_ID/send-email
Body: { "email": "user@example.com", "roleId": "..." }
→ Gửi email thành công
```

### Use Case 2: Admin mời user vào public project
```javascript
// ❌ Not Allowed
POST /home/invites/PUBLIC_PROJECT_ID/send-email
Body: { "email": "user@example.com", "roleId": "..." }
→ 400 Bad Request: "Dự án công khai không cần gửi lời mời..."
```

### Use Case 3: User tự join public project
```javascript
// ✅ Allowed
POST /home/invites/PUBLIC_PROJECT_ID/join-public
→ 200 OK: User được thêm với role Viewer
```

### Use Case 4: User cố join private project
```javascript
// ❌ Not Allowed
POST /home/invites/PRIVATE_PROJECT_ID/join-public
→ 403 Forbidden: "Dự án này là private..."
```

### Use Case 5: User click permanent link (public project)
```javascript
// ✅ Allowed
GET /home/invites/TOKEN
→ 200 OK: User được thêm tự động
```

### Use Case 6: User click permanent link (private project)
```javascript
// ✅ Allowed (nếu có token hợp lệ)
GET /home/invites/TOKEN
→ 200 OK: User được thêm nếu token đúng
```

---

## 🔍 Response Data mới

### handleInviteLink - Thêm field `visibility`
```json
{
  "message": "Đã tham gia dự án với vai trò viewer",
  "project_id": "6123456789abcdef01234567",
  "visibility": "public"  // ← NEW
}
```

### getUserInvites - Thêm field `visibility` trong project
```json
{
  "invites": [
    {
      "project": {
        "_id": "...",
        "name": "Project ABC",
        "description": "...",
        "visibility": "private"  // ← NEW
      }
    }
  ]
}
```

---

## 🎨 Frontend Flow

### Flow cho Private Project:
```
1. User nhận email invite
2. Click "Accept"
3. FE gọi: POST /invites/:inviteId/accept
4. User được thêm vào project
```

### Flow cho Public Project:
```
1. User tìm thấy public project (từ search, browse...)
2. Click "Join Project"
3. FE gọi: POST /invites/:projectId/join-public
4. User được thêm ngay lập tức
```

### Flow UI hiển thị:
```javascript
// Check visibility trước khi hiển thị nút
if (project.visibility === 'public') {
  // Hiển thị nút "Join Now" (không cần accept)
  <Button onClick={() => joinPublicProject(project._id)}>
    Join Now
  </Button>
} else {
  // Hiển thị "Request Invite" hoặc chờ email
  <Button disabled>
    Private - Invite Only
  </Button>
}
```

---

## 🧪 Test Cases

### Test 1: Gửi invite cho private project ✅
```bash
POST /home/invites/PRIVATE_PROJECT_ID/send-email
Body: {"email": "test@example.com", "roleId": "..."}
Expected: 201 Created
```

### Test 2: Gửi invite cho public project ❌
```bash
POST /home/invites/PUBLIC_PROJECT_ID/send-email
Body: {"email": "test@example.com", "roleId": "..."}
Expected: 400 Bad Request
Message: "Dự án công khai không cần gửi lời mời..."
```

### Test 3: Join public project ✅
```bash
POST /home/invites/PUBLIC_PROJECT_ID/join-public
Expected: 200 OK
```

### Test 4: Join private project ❌
```bash
POST /home/invites/PRIVATE_PROJECT_ID/join-public
Expected: 403 Forbidden
Message: "Dự án này là private..."
```

### Test 5: Accept invite của public project ❌
```bash
POST /home/invites/INVITE_ID/accept (invite của public project)
Expected: 400 Bad Request
Message: "Dự án công khai không cần chấp nhận lời mời..."
```

---

## 📌 Tóm tắt

### Private Project:
- ✅ **BẮT BUỘC** có invite để join
- ✅ Gửi email invite
- ✅ Phải Accept/Reject
- ❌ Không thể tự join

### Public Project:
- ✅ **TỰ JOIN** trực tiếp
- ❌ Không gửi email invite
- ❌ Không cần Accept/Reject
- ✅ Permanent link vẫn hoạt động (optional)

---

## 🔄 Migration Notes

Nếu đã có data cũ:
1. Tất cả project mặc định là `visibility: 'private'`
2. Admin có thể update `visibility` thành `'public'` nếu muốn
3. Các invite cũ vẫn hoạt động bình thường

---

## 🚀 Best Practices

1. **Public Project:** 
   - Dùng cho open-source, community projects
   - Không cần quản lý invite
   - User tự join và explore

2. **Private Project:**
   - Dùng cho internal, company projects
   - Kiểm soát chặt chẽ thành viên
   - Gửi invite có chọn lọc

3. **Permanent Link:**
   - Private: Chỉ share cho người tin tưởng
   - Public: Share thoải mái, như Discord server link

---

## ✅ Checklist Implementation

- [x] Thêm check visibility trong `sendInviteByEmail`
- [x] Thêm check visibility trong `acceptInvite`
- [x] Thêm field `visibility` trong response
- [x] Tạo API `joinPublicProject`
- [x] Thêm route `/join-public`
- [x] Update documentation
- [ ] Frontend implement UI cho public/private
- [ ] Test đầy đủ các scenarios
