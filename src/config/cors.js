import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Cấu hình CORS Option trong dự án thực tế (Video số 62 trong chuỗi MERN Stack Pro)
export const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép Postman và môi trường dev
    if (!origin && (env.BUILD_MODE === 'dev' || env.BUILD_MODE === 'production')) {
      return callback(null, true)
    }

    if (origin.includes('.vercel.app')) {
      return callback(null, true)
    }

    // Kiểm tra domain có trong whitelist không
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    // Domain không được chấp nhận
    return callback(
      new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`)
    )
  },
  optionsSuccessStatus: 200,
  credentials: true,
}
