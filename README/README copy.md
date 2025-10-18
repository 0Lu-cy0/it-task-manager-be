# 📚 Swagger API Documentation

Thư mục này chứa tài liệu API hoàn chỉnh cho IT Task Manager Backend được viết bằng OpenAPI 3.0 specification.

## 📁 Cấu trúc files

```
swagger/
├── README.md              # File này
├── index.yaml            # File tổng hợp (không sử dụng trực tiếp)
├── components.yaml       # Schemas, responses, security definitions
├── auth.yaml            # Authentication & Authorization endpoints
├── projects.yaml        # Project Management endpoints
├── tasks.yaml           # Task Management endpoints
└── other-endpoints.yaml # Dashboard, Invite, Search, Notifications
```

## 🚀 Cách sử dụng

### 1. Truy cập Swagger UI
```
http://localhost:8181/api-docs
```

### 2. Lấy raw OpenAPI spec
```
http://localhost:8181/swagger.json
```

### 3. Import vào Postman
1. Mở Postman
2. Click "Import" 
3. Paste URL: `http://localhost:8181/swagger.json`
4. Click "Continue" và "Import"

## 🔧 Cấu hình

Swagger được cấu hình trong `src/config/swagger.js` với các tính năng:

- **Auto-discovery**: Tự động load tất cả `.yaml` files
- **Custom styling**: UI được tùy chỉnh cho đẹp hơn
- **Persistent auth**: Lưu JWT token trong session
- **Try it out**: Test API trực tiếp từ documentation
- **Request duration**: Hiển thị thời gian response

## 📝 Thêm endpoint mới

### Cách 1: Thêm vào file YAML có sẵn
```yaml
paths:
  /your/new/endpoint:
    post:
      tags:
        - YourTag
      summary: Mô tả ngắn
      description: Mô tả chi tiết
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                field1:
                  type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'
```

### Cách 2: Thêm JSDoc comments trong route files
```javascript
/**
 * @swagger
 * /your/endpoint:
 *   post:
 *     tags: [YourTag]
 *     summary: Mô tả endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/your/endpoint', controller.method)
```

## 🎯 Best Practices

### 1. Naming Convention
- **Tags**: PascalCase (Authentication, Projects)
- **Endpoints**: kebab-case (/reset-password/request)
- **Parameters**: snake_case (user_id, project_id)
- **Schemas**: PascalCase (User, Project, Task)

### 2. Response Structure
Tất cả responses đều follow cấu trúc:
```json
{
  "status": "success|error",
  "message": "Descriptive message",
  "data": {}, // actual data
  "errors": [] // validation errors if any
}
```

### 3. Error Handling
- Sử dụng standard HTTP status codes
- Provide meaningful error messages
- Include validation details trong errors array

### 4. Security
- Tất cả protected endpoints phải có `security: [bearerAuth: []]`
- Document required permissions trong description
- Explain rate limiting nếu có

## 🔍 Validation

Để validate OpenAPI spec:

```bash
# Install swagger-codegen-cli
npm install -g swagger-codegen-cli

# Validate spec
swagger-codegen validate -i http://localhost:8181/swagger.json
```

## 📖 Tài liệu tham khảo

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Configuration](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)

## 🐛 Troubleshooting

### Swagger UI không load
1. Check console errors
2. Verify YAML syntax
3. Ensure all $ref paths are correct
4. Restart server

### Endpoints không hiển thị
1. Check file paths trong swagger.js
2. Verify YAML structure
3. Check indentation (YAML sensitive)

### Authentication không work
1. Verify bearerAuth security scheme
2. Check JWT token format
3. Ensure token có prefix "Bearer "