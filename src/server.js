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
import { setupMeiliIndexes } from '~/utils/searchUtils'
import responseWrapper from './middlewares/responseWrapper'

const START_SERVER = () => {
  const app = express()

  app.use(cors(corsOptions))

  //Enable req.body json data
  app.use(express.json())

  // đăng ký middleware bọc response toàn cục (sau body parser, trước routes)
  app.use(responseWrapper)

  //Route
  app.get('/root', (req, res) => {
    res.send('Backend is running 🚀. Use /auth/... for authentication APIs.')
  })
  app.use('/', APIs_auth)
  app.use('/home', APIs_home)

  // Swagger Docs
  swaggerDocs(app)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // đăng ký error-handler của responseWrapper sau cùng làm fallback
  app.use(responseWrapper.errorHandler)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
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

      // Setup MeiliSearch indexes
      await setupMeiliIndexes()

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


