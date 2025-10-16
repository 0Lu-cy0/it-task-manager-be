const { createApiResponse, isApiResponse, createErrorResponse } = require('../utils/apiResponse')

function responseWrapper(req, res, next) {
  const oldJson = res.json
  const oldSend = res.send

  res.json = function (body) {
    if (isApiResponse(body)) {
      return oldJson.call(this, body)
    }
    const status = Number.isInteger(res.statusCode) ? res.statusCode : 200
    const wrapped = createApiResponse(body, { status })
    return oldJson.call(this, wrapped)
  }

  res.send = function (body) {
    if (typeof body === 'object' && body !== null) {
      return res.json(body)
    }
    return oldSend.call(this, body)
  }

  next()
}

function responseErrorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)
  const status = err && (err.status || err.statusCode) ? (err.status || err.statusCode) : 500
  const wrapped = createErrorResponse(err, { status })
  res.status(status).json(wrapped)
}

module.exports = responseWrapper
module.exports.errorHandler = responseErrorHandler
