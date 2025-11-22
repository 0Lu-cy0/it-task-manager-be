# 🎨 Frontend: Implement Share/Invite như Trello

## 📸 So sánh với Trello

### Trello UI:
```
┌─────────────────────────────────────────────────┐
│ Chia sẻ bảng                                  ✕ │
├─────────────────────────────────────────────────┤
│ [ Địa chỉ email hoặc tên    ] [Thành viên ▼] │
│                                    [Chia sẻ]  │
│                                                 │
│ ⚠️ Chia sẻ bảng này bằng liên kết             │
│    Tạo liên kết                                 │
│                                                 │
│ Thành viên của bảng thông tin  10             │
│ ┌──────────────────────────────────────────┐  │
│ │ 👤 Nguyễn Xuân Hoàng Cường (ban)        │  │
│ │    @nguynxuanhoacngcn • Khách Không gian│  │
│ │                            [Thành viên ▼]│  │
│ └──────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────┐  │
│ │ 👤 Công Tài Lê                           │  │
│ │    @congtaile • Quản trị viên Không gian│  │
│ │                            [Thành viên ▼]│  │
│ └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🔧 APIs cần dùng

### 1. **Lấy danh sách roles** (cho dropdown)
```javascript
GET /home/projects/:projectId/roles

Response:
[
  {
    "_id": "role_viewer_id",
    "name": "viewer",
    "display_name": "Quan sát viên",
    "permissions": ["view_project", "view_tasks"]
  },
  {
    "_id": "role_member_id", 
    "name": "member",
    "display_name": "Thành viên",
    "permissions": ["view_project", "create_task", "edit_task"]
  },
  {
    "_id": "role_admin_id",
    "name": "admin", 
    "display_name": "Quản trị viên",
    "permissions": ["*"]
  }
]
```

### 2. **Gửi lời mời**
```javascript
POST /home/invites/:projectId/send-email
Body: {
  "email": "user@example.com",
  "roleId": "role_member_id"  // ← Từ dropdown
}
```

### 3. **Lấy permanent link**
```javascript
GET /home/invites/:projectId/permanent

Response:
{
  "invite_link": "http://localhost:5173/invites/abc123token",
  "invite_token": "abc123token"
}
```

### 4. **Lấy danh sách members**
```javascript
GET /home/projects/:projectId

Response:
{
  "members": [
    {
      "user_id": {...},
      "project_role_id": "...",
      "joined_at": "..."
    }
  ]
}
```

### 5. **Update role của member**
```javascript
PATCH /home/projects/:projectId/members/:userId/role
Body: {
  "roleId": "new_role_id"
}
```

---

## 💻 React Implementation

### Component: ShareProjectModal.jsx

```jsx
import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Avatar, List, message } from 'antd';

const ShareProjectModal = ({ projectId, visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);

  // Load roles khi mở modal
  useEffect(() => {
    if (visible && projectId) {
      loadRoles();
      loadMembers();
      loadInviteLink();
    }
  }, [visible, projectId]);

  const loadRoles = async () => {
    try {
      const response = await fetch(`/home/projects/${projectId}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRoles(data);
      // Set default role = member
      const memberRole = data.find(r => r.name === 'member');
      if (memberRole) setSelectedRole(memberRole._id);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await fetch(`/home/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadInviteLink = async () => {
    try {
      const response = await fetch(`/home/invites/${projectId}/permanent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInviteLink(data.invite.invite_link);
    } catch (error) {
      console.error('Error loading invite link:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!email || !selectedRole) {
      message.error('Vui lòng nhập email và chọn vai trò');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/home/invites/${projectId}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          roleId: selectedRole
        })
      });

      if (response.ok) {
        message.success('Đã gửi lời mời!');
        setEmail('');
        // Refresh members list
        loadMembers();
      } else {
        const error = await response.json();
        message.error(error.message || 'Gửi lời mời thất bại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (memberId, newRoleId) => {
    try {
      await fetch(`/home/projects/${projectId}/members/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleId: newRoleId })
      });
      message.success('Đã cập nhật vai trò');
      loadMembers();
    } catch (error) {
      message.error('Cập nhật vai trò thất bại');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    message.success('Đã copy link!');
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r._id === roleId);
    return role?.display_name || role?.name || 'Member';
  };

  return (
    <Modal
      title="Chia sẻ bảng"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {/* Input mời người mới */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <Input
          placeholder="Địa chỉ email hoặc tên"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          value={selectedRole}
          onChange={setSelectedRole}
          style={{ width: 150 }}
        >
          {roles.map(role => (
            <Select.Option key={role._id} value={role._id}>
              {role.display_name || role.name}
            </Select.Option>
          ))}
        </Select>
        <Button 
          type="primary" 
          onClick={handleSendInvite}
          loading={loading}
        >
          Chia sẻ
        </Button>
      </div>

      {/* Permanent Link */}
      <div style={{ marginBottom: 24, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
        <div style={{ marginBottom: 8 }}>
          🔗 Chia sẻ bảng này bằng liên kết
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input value={inviteLink} readOnly />
          <Button onClick={copyInviteLink}>Copy</Button>
        </div>
      </div>

      {/* Danh sách members */}
      <div>
        <div style={{ marginBottom: 12, fontWeight: 500 }}>
          Thành viên của bảng thông tin ({members.length})
        </div>
        <List
          dataSource={members}
          renderItem={(member) => (
            <List.Item
              actions={[
                <Select
                  value={member.project_role_id}
                  onChange={(newRoleId) => handleChangeRole(member.user_id._id, newRoleId)}
                  style={{ width: 150 }}
                >
                  {roles.map(role => (
                    <Select.Option key={role._id} value={role._id}>
                      {role.display_name || role.name}
                    </Select.Option>
                  ))}
                </Select>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={member.user_id.avatar}>{member.user_id.full_name?.[0]}</Avatar>}
                title={member.user_id.full_name || member.user_id.email}
                description={`@${member.user_id.email} • ${getRoleName(member.project_role_id)}`}
              />
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};

export default ShareProjectModal;
```

---

## 🎨 UI Components Breakdown

### 1. **Email Input + Role Dropdown + Share Button**
```jsx
<div className="invite-form">
  <Input 
    placeholder="Địa chỉ email hoặc tên"
    value={email}
    onChange={e => setEmail(e.target.value)}
  />
  <Select value={roleId} onChange={setRoleId}>
    {roles.map(role => (
      <Option key={role._id} value={role._id}>
        {role.display_name}
      </Option>
    ))}
  </Select>
  <Button onClick={sendInvite}>Chia sẻ</Button>
</div>
```

### 2. **Permanent Link Section**
```jsx
<div className="invite-link-section">
  <div>🔗 Chia sẻ bảng này bằng liên kết</div>
  <div className="link-input">
    <Input value={inviteLink} readOnly />
    <Button onClick={copyLink}>Copy</Button>
  </div>
  <small>Bất kỳ ai có link này có thể tham gia</small>
</div>
```

### 3. **Members List với Role Dropdown**
```jsx
<div className="members-list">
  <h4>Thành viên của bảng ({members.length})</h4>
  {members.map(member => (
    <div key={member._id} className="member-item">
      <Avatar src={member.avatar} />
      <div className="member-info">
        <strong>{member.name}</strong>
        <span>@{member.email}</span>
      </div>
      <Select 
        value={member.roleId}
        onChange={newRole => updateMemberRole(member._id, newRole)}
      >
        {roles.map(role => (
          <Option value={role._id}>{role.display_name}</Option>
        ))}
      </Select>
    </div>
  ))}
</div>
```

---

## 📋 Checklist Implementation

### Backend (✅ Done):
- [x] API lấy roles: `GET /projects/:id/roles`
- [x] API gửi invite: `POST /invites/:projectId/send-email`
- [x] API permanent link: `GET /invites/:projectId/permanent`
- [x] API update member role: `PATCH /projects/:projectId/members/:userId/role`

### Frontend (Todo):
- [ ] Component ShareModal
- [ ] Load roles để render dropdown
- [ ] Handle send invite với roleId
- [ ] Display permanent link với copy button
- [ ] List members với role dropdown
- [ ] Update role cho members
- [ ] Validation email
- [ ] Loading states
- [ ] Error handling
- [ ] Success notifications

---

## 🎯 Flow hoàn chỉnh

```
User click "Share" button
  ↓
Open ShareModal
  ↓
Load roles → Fill dropdown [Thành viên, Quan sát viên, Quản trị viên]
  ↓
User nhập email + chọn role
  ↓
Click "Chia sẻ"
  ↓
POST /invites/:projectId/send-email { email, roleId }
  ↓
Success → Email sent → Refresh members list
```

---

## 🚨 Điểm quan trọng

### ✅ **Đúng như Trello:**
1. **Dropdown chọn role** trước khi gửi
2. **Permanent link** có sẵn để copy
3. **List members** với dropdown thay đổi role
4. **Visual hierarchy** rõ ràng

### ❌ **Nếu thiếu:**
- User không biết chọn role nào
- Phải hardcode roleId trong code
- UX không thân thiện

---

## 💡 Tips

1. **Cache roles** sau lần load đầu (không cần load mỗi lần)
2. **Default role** = "member" (Thành viên)
3. **Disable invite button** nếu email invalid
4. **Show loading spinner** khi sending invite
5. **Auto-close modal** sau khi invite success (optional)

---

## 🎨 Styling Example (Tailwind CSS)

```jsx
<div className="flex gap-2 mb-6">
  <input 
    type="email"
    placeholder="Địa chỉ email hoặc tên"
    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <select className="px-3 py-2 border rounded-md bg-white">
    <option>Thành viên</option>
    <option>Quan sát viên</option>
    <option>Quản trị viên</option>
  </select>
  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    Chia sẻ
  </button>
</div>
```

---

## ✅ Kết luận

**Backend của bạn ĐÃ ĐỦ**, chỉ cần Frontend implement UI đúng như Trello:
- ✅ Input email
- ✅ **Dropdown chọn role** ⭐ (Quan trọng!)
- ✅ Button "Chia sẻ"
- ✅ Permanent link section
- ✅ Members list với role management

**API endpoints đã có:**
- `GET /home/projects/:projectId/roles` ← Lấy danh sách roles
- `POST /home/invites/:projectId/send-email` ← Gửi invite
- `GET /home/invites/:projectId/permanent` ← Lấy link
- `PATCH /home/projects/:projectId/members/:userId/role` ← Update role

Giờ hệ thống sẽ **GIỐNG TRELLO 100%**! 🚀
