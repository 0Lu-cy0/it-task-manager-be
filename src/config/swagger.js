import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { env } from '~/config/environment'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IT Task Manager API',
      version: '1.0.0',
      description: 'RESTful API documentation for IT Task Manager',
    },
    servers: [
      {
        url: `http://${env.APP_HOST}:${env.APP_PORT}`,
        description: 'Development Server',
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
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success', 'error'],
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
  apis: [
    './src/routes/**/*.js',
    './src/models/*.js',
    './src/swagger/*.yaml',
  ], // nơi chứa API docs
}

const swaggerSpec = swaggerJSDoc(options)

export const swaggerDocs = (app) => {
  // Serve swagger docs
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'IT Task Manager API Documentation',
    }),
  )

  // Serve swagger spec
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}
