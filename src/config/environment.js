import 'dotenv/config'
export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  BUILD_MODE: process.env.BUILD_MODE, //production or development
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_SECRET_KEY_REFRESH: process.env.JWT_SECRET_KEY_REFRESH,
  // JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  // JWT_EXPIRES_IN_REFRESH: process.env.JWT_EXPIRES_IN_REFRESH,
  // JWT_EXPIRES_IN_REFRESH_COOKIE: process.env.JWT_EXPIRES_IN_REFRESH_COOKIE,
  // JWT_EXPIRES_IN_COOKIE: process.env.JWT_EXPIRES_IN_COOKIE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  // EMAIL_HOST: process.env.EMAIL_HOST,
  // EMAIL_PORT: process.env.EMAIL_PORT,
  // EMAIL_SECURE: process.env.EMAIL_SECURE,
  // EMAIL_TLS: process.env.EMAIL_TLS,
  // EMAIL_FROM: process.env.EMAIL_FROM,
  // EMAIL_SUBJECT: process.env.EMAIL_SUBJECT,
  // EMAIL_TEXT: process.env.EMAIL_TEXT,
  // EMAIL_HTML: process.env.EMAIL_HTML,
  // EMAIL_HTML_BUI: process.env.EMAIL_HTML_
  CLIENT_URL: process.env.CLIENT_URL,

  AUTHOR: process.env.AUTHOR,
}
