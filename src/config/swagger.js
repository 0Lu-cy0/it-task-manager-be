import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { env } from '~/config/environment'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IT Task Manager API',
      version: '1.0.0',
      description: 'API documentation for IT Task Manager Backend',
    },
    servers: [
      {
        url: `http://${env.APP_HOST}:${env.APP_PORT}`,
        description: 'Development Server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Projects', description: 'Project management' },
      { name: 'Tasks', description: 'Task management' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/**/*.js',
    './src/models/*.js',
    './src/swagger/swagger.yaml',
  ],
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
