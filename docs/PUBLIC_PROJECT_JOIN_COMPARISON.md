# 🎯 So sánh Role khi Join Public Project

## 📊 Tổng quan

Public project có **2 cách join** với **role khác nhau**:

---

## 1️⃣ Direct Join (Tự tham gia)

### API:
```
POST /home/invites/:projectId/join-public
```

### Kết quả:
- **Role:** `viewer` (fixed)
- **Không cần:** Invite, Accept/Reject
- **Use case:** User tự khám phá và join

### Example:
```javascript
POST /home/invites/123abc/join-public
→ User được thêm với role "viewer"
```

---

## 2️⃣ Accept Invite (Nhận lời mời)

### API:
```
POST /home/invites/:inviteId/accept
```

### Kết quả:
- **Role:** Theo invite (có thể là `member`, `viewer`, hoặc role khác)
- **Cần:** Nhận invite email trước
- **Use case:** Admin muốn assign role cụ thể

### Example:
```javascript
// Admin gửi invite với role "member"
POST /home/invites/123abc/send-email
Body: { "email": "user@example.com", "roleId": "member_role_id" }

// User accept
POST /home/invites/invite_id/accept
→ User được thêm với role "member" (không phải viewer!)
```

---

## 🎯 Khi nào dùng cách nào?

### ✅ Dùng Direct Join khi:
- User tự khám phá project
- Không quan tâm role cao hơn
- Muốn join nhanh, không cần chờ invite

### ✅ Dùng Invite khi:
- Muốn assign role cụ thể (member, contributor...)
- Cần track ai mời ai
- Personalized onboarding
- Marketing/notification

---

## 💡 Ví dụ thực tế

### Scenario 1: Open Source Project
```
Project: "React Clone" (public)

User A: Tự tìm thấy → Direct join → Viewer
User B: Admin mời làm Contributor → Accept → Member
```

### Scenario 2: Community Discord-like
```
Project: "Gaming Community" (public)

- Link public trên Twitter → Users direct join → Viewers
- Moderators được invite riêng → Members với permissions cao hơn
```

### Scenario 3: Educational Platform
```
Project: "Learn JavaScript" (public)

- Students: Direct join → Viewer (read-only)
- Teaching Assistants: Invited → Member (can edit)
```

---

## 📋 Comparison Table

| Tiêu chí | Direct Join | Accept Invite |
|----------|-------------|---------------|
| **API** | `POST /join-public` | `POST /accept` |
| **Role** | Viewer (fixed) | Customizable |
| **Cần invite?** | ❌ Không | ✅ Có |
| **Speed** | ⚡ Instant | 🐌 Chờ email |
| **Control** | ❌ Không kiểm soát | ✅ Admin kiểm soát |
| **Use case** | Self-service | Managed access |

---

## 🔄 Flow Chart

```
PUBLIC PROJECT
│
├─ User tự tìm thấy
│  └─ POST /join-public
│     └─ Role: Viewer
│
└─ Admin mời
   └─ POST /send-email (roleId: member)
      └─ User nhận email
         └─ POST /accept
            └─ Role: Member (theo invite)
```

---

## 🎨 Frontend Implementation

```javascript
// Component: ProjectCard.jsx
const ProjectCard = ({ project }) => {
  const [userRole, setUserRole] = useState(null);
  
  // Check if user has pending invite
  const hasPendingInvite = invites.find(inv => inv.project._id === project._id);
  
  if (project.visibility === 'public') {
    return (
      <div>
        {hasPendingInvite ? (
          // Có invite → Hiển thị role trong invite
          <div>
            <Badge>Invited as {hasPendingInvite.role}</Badge>
            <Button onClick={() => acceptInvite(hasPendingInvite._id)}>
              Accept Invite (Join as {hasPendingInvite.role})
            </Button>
            <Button onClick={() => joinPublic(project._id)}>
              or Join as Viewer
            </Button>
          </div>
        ) : (
          // Không có invite → Chỉ có direct join
          <Button onClick={() => joinPublic(project._id)}>
            🌍 Join as Viewer
          </Button>
        )}
      </div>
    );
  }
  
  // Private project
  return <Badge>🔒 Private - Invite Only</Badge>;
};
```

---

## 🧪 Test Cases

### Test 1: Direct join public project
```bash
POST /home/invites/PUBLIC_PROJECT_ID/join-public
Expected: 200 OK
Role: viewer
```

### Test 2: Accept invite for public project with custom role
```bash
# Step 1: Admin gửi invite với role member
POST /home/invites/PUBLIC_PROJECT_ID/send-email
Body: {"email": "user@test.com", "roleId": "MEMBER_ROLE_ID"}

# Step 2: User accept
POST /home/invites/INVITE_ID/accept
Expected: 200 OK
Role: member (NOT viewer!)
```

### Test 3: So sánh role sau khi join
```bash
# User A: Direct join
POST /join-public → Role: viewer

# User B: Accept invite (member)
POST /accept → Role: member

# Verify: User B có permissions cao hơn User A
```

---

## 💡 Best Practices

### Cho Admin:
1. **Public project với viewer access:** Let users self-join
2. **Public project với custom roles:** Send invites với role cụ thể
3. **Marketing campaigns:** Send invites as notifications

### Cho Frontend:
1. **Hiển thị cả 2 options** nếu user có pending invite
2. **Giải thích role difference** để user biết chọn gì
3. **Badge/Icon** để phân biệt viewer vs member

### Cho Backend:
1. **Track** invite source (direct vs invited)
2. **Analytics** xem bao nhiêu % users join qua invite
3. **Metrics** growth từ mỗi channel

---

## 📌 Key Takeaways

1. ✅ **Public project CÓ THỂ gửi invite** - Để assign custom roles
2. ✅ **Direct join = Viewer** - Quick access, no permission
3. ✅ **Accept invite = Custom role** - Controlled access
4. ✅ **Cả 2 cách đều hợp lý** - Tùy use case

**Kết luận:** Cho phép gửi invite cho public project là **ĐÚNG** vì có nhiều use cases hợp lý! 🎯
