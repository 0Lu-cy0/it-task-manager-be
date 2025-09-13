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

const START_SERVER = () => {
  const app = express()

  app.use(cors(corsOptions))

  //Enable req.body json data
  app.use(express.json())

  //Route
  app.use('/', APIs_auth)
  app.use('/home', APIs_home)

  // Swagger Docs
  swaggerDocs(app)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

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

(async () => {
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


