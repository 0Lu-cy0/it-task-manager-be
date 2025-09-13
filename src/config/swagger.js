import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0', // chuẩn OpenAPI
    info: {
      title: 'IT Task Manager API',
      version: '1.0.0',
      description: 'Tài liệu API cho backend Node.js',
    },
    servers: [
      {
        url: 'http://localhost:8181/api', // base URL API của bạn
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/models/*.js'], // nơi chứa API docs
}

const swaggerSpec = swaggerJSDoc(options)

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
