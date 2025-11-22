# Migration: Xóa Role "Viewer"

## 📋 Mục đích

Migration này được tạo ra để xóa hoàn toàn role "viewer" khỏi hệ thống sau khi đã chuyển đổi sang sử dụng "member" làm role mặc định.

## 🔍 Bước 1: Kiểm tra trước khi migrate

Trước khi chạy migration, bạn nên kiểm tra xem có bao nhiêu viewer role đang tồn tại:

```bash
node --experimental-specifier-resolution=node src/scripts/check-viewer-role.js
```

Script này sẽ hiển thị:
- Tổng số viewer roles trong database
- Chi tiết từng project có viewer role
- Số lượng users đang sử dụng viewer role
- Danh sách users sẽ bị ảnh hưởng

## 🚀 Bước 2: Chạy Migration

**⚠️ CẢNH BÁO: Script này sẽ thay đổi database. Hãy backup trước khi chạy!**

```bash
# Backup database trước
mongodump --uri="mongodb://localhost:27017/your-database" --out=./backup

# Chạy migration
node --experimental-specifier-resolution=node src/scripts/migrate-remove-viewer-role.js
```

## 📝 Migration sẽ làm gì?

1. **Thống kê**: Đếm số lượng viewer roles và users bị ảnh hưởng
2. **Migrate Users**: Chuyển tất cả users có role "viewer" sang role "member"
3. **Xóa Role Definitions**: Xóa tất cả viewer role definitions khỏi collection `project_roles`
4. **Verification**: Kiểm tra lại sau khi migrate xem còn viewer role nào không

## 🔄 Migration Flow

```
┌─────────────────────────────────────┐
│ 1. Thống kê trước khi migrate      │
│    - Đếm viewer roles               │
│    - Đếm users có viewer role       │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 2. Migrate users                    │
│    viewer → member                  │
│    (từng project một)               │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 3. Xóa viewer role definitions      │
│    từ project_roles collection      │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 4. Thống kê sau khi migrate        │
│    - Verify không còn viewer        │
└─────────────────────────────────────┘
```

## ✅ Kết quả mong đợi

Sau khi chạy migration thành công:
- ✅ Tất cả users có role "viewer" đã được chuyển sang "member"
- ✅ Không còn role definition nào có name = "viewer"
- ✅ Hệ thống chỉ còn 3 roles: owner, lead, member

## 🔙 Rollback (nếu cần)

Nếu cần rollback migration:

```bash
# Restore từ backup
mongorestore --uri="mongodb://localhost:27017/your-database" ./backup
```

## 📊 Ví dụ Output

### Check Script Output:
```
🔍 Kiểm tra viewer role trong database...

📊 Tổng số viewer roles: 3

📋 Chi tiết theo từng project:

   Project: "Website Redesign" (507f1f77bcf86cd799439011)
   - Viewer Role ID: 507f191e810c19729de860ea
   - Số users có viewer role: 2
   - Users:
     + john@example.com
     + jane@example.com

═══════════════════════════════════════════════════
📊 TỔNG KẾT:
   - Tổng viewer roles: 3
   - Tổng users có viewer role: 5
═══════════════════════════════════════════════════

⚠️  Cảnh báo: Có users đang sử dụng viewer role!
   Nếu chạy migration, họ sẽ được chuyển sang role "member".
```

### Migration Script Output:
```
🚀 Starting migration: Remove viewer role...

📊 Thống kê trước khi migrate:
   - Tổng số viewer roles: 3
   - Tổng số users có role viewer: 5
   - Số projects bị ảnh hưởng: 3

🔄 Bắt đầu migrate users từ viewer sang member...

   ✅ Project "Website Redesign": Đã migrate 2 users
   ✅ Project "Mobile App": Đã migrate 2 users
   ✅ Project "Backend API": Đã migrate 1 users

✅ Tổng cộng đã migrate 5 users từ viewer sang member

🗑️  Bắt đầu xóa viewer role definitions...

   ✅ Đã xóa 3 viewer role definitions

📊 Thống kê sau khi migrate:
   - Số viewer roles còn lại: 0
   - Số users còn có role viewer: 0

🎉 Migration thành công! Đã xóa hoàn toàn viewer role khỏi hệ thống.
```

## 🛡️ Safety Features

- ✅ Sử dụng MongoDB Transaction để đảm bảo atomicity
- ✅ Rollback tự động nếu có lỗi
- ✅ Logging chi tiết từng bước
- ✅ Verification sau khi migrate

## 📞 Hỗ trợ

Nếu gặp vấn đề khi chạy migration, vui lòng:
1. Kiểm tra log chi tiết
2. Đảm bảo đã backup database
3. Kiểm tra connection tới MongoDB
4. Liên hệ team để được hỗ trợ
