# Quick Guide: Xóa Viewer Role

## 🚀 Cách sử dụng nhanh

### Bước 1: Kiểm tra
```bash
npm run migrate:check-viewer
# hoặc
yarn migrate:check-viewer
```

### Bước 2: Backup Database
```bash
# Backup toàn bộ database
mongodump --uri="mongodb://localhost:27017/it-task-manager" --out=./backup-$(date +%Y%m%d)

# Hoặc chỉ backup collection liên quan
mongodump --uri="mongodb://localhost:27017/it-task-manager" \
  --collection=projects \
  --collection=project_roles \
  --out=./backup-$(date +%Y%m%d)
```

### Bước 3: Chạy Migration
```bash
npm run migrate:remove-viewer
# hoặc
yarn migrate:remove-viewer
```

### Bước 4: Verify
```bash
# Kiểm tra lại xem còn viewer role không
npm run migrate:check-viewer
```

## 📋 Checklist trước khi chạy

- [ ] Đã backup database
- [ ] Đã chạy script check để biết impact
- [ ] Đã thông báo cho team (nếu cần)
- [ ] Đang ở môi trường đúng (dev/staging/production)
- [ ] Đã đọc file MIGRATION_REMOVE_VIEWER.md

## 🔙 Rollback nếu cần

```bash
# Restore từ backup
mongorestore --uri="mongodb://localhost:27017/it-task-manager" ./backup-20241114

# Hoặc drop database và restore
mongorestore --drop --uri="mongodb://localhost:27017/it-task-manager" ./backup-20241114
```

## ⚠️ Lưu ý

- Migration sử dụng transaction, nên sẽ rollback tự động nếu có lỗi
- Tất cả users có role "viewer" sẽ được chuyển sang "member"
- Sau khi chạy, không thể tạo user với role "viewer" nữa
