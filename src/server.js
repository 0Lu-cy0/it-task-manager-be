/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CLOSE_DB, CONNECT_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_home } from './routes/home'
import { APIs_auth } from './routes/auth'
import { swaggerDocs } from '~/config/swagger'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import responseWrapper from './middlewares/responseWrapper'

const START_SERVER = () => {
  const app = express()

  app.use(cors(corsOptions))

  //Enable req.body json data - Increase limit for large payloads
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))

  // đăng ký middleware bọc response toàn cục (sau body parser, trước routes)
  app.use(responseWrapper)

  //Route
  app.get('/', (req, res) => {
    res.send('Backend is running 🚀. Visit /api-docs for API documentation.')
  })

  // API routes - keep original paths to avoid breaking changes
  app.use('/auth', APIs_auth)
  app.use('/home', APIs_home)

  // Swagger Docs
  swaggerDocs(app)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)
  app.use(responseWrapper.errorHandler)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3. Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })

  //Thực hiện các tác vụ cleanup trước khi dừng server lại
  exitHook(() => {
    console.log('\n4. Goodbye Cat2004 :>>>, never see again !-_-!')
    CLOSE_DB()
  })
}

  ; (async () => {
    try {
      console.log('1. Connecting to MongoDB Cloud Atlas...')
      await CONNECT_DB()
      console.log('2. Connected to MongoDB Cloud Atlas!')

      //Khởi động Server Back-end sau-khi-đã Connect-Database- thành công
      START_SERVER()
    } catch (error) {
      console.error(error)
      process.exit(0)
    }
  })()

// CONNECT_DB()
//   .then(() => 'Đã kết nối tới MongoDB Cloud Atlat!')
//   .then(() => START_SERVER())
//   .catch(err => {
//     console.error(err)
//     process.exit(0)
//   })
