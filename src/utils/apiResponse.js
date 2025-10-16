function createApiResponse(data, opts = {}) {
  // opts: { status: number, statusCode?: number, object?: string }
  const status = typeof opts.status === 'number' ? opts.status : 200
  const statusCode = typeof opts.statusCode === 'number' ? opts.statusCode : status
  const objectName =
    typeof opts.object === 'string'
      ? opts.object
      : data && data.constructor && data.constructor.name
        ? data.constructor.name
        : typeof data
  const isOk = status >= 200 && status < 300
  const isError = !isOk

  // tách message ra ngoài nếu payload có message
  let message
  let finalData

  if (data && typeof data === 'object' && !Array.isArray(data) && ('message' in data)) {
    message = data.message
    if ('data' in data) {
      finalData = data.data
    } else {
      const { message: _m, ...rest } = data
      finalData = Object.keys(rest).length ? rest : null
    }
  } else {
    finalData = data === undefined ? null : data
  }

  // đặt message trước data để output rõ ràng: message (nếu có) rồi đến data
  const result = {
    Status: status,
    StatusCode: statusCode,
    Object: objectName,
    isOk,
    isError,
  }

  if (message !== undefined) result.message = message
  result.data = finalData

  return result
}

// thêm: kiểm tra object đã theo ApiResponse shape chưa
function isApiResponse(obj) {
  return obj && typeof obj === 'object' && ('Status' in obj) && ('StatusCode' in obj) && ('isOk' in obj)
}

// thêm: tạo response cho lỗi
function createErrorResponse(err, opts = {}) {
  const status = typeof opts.status === 'number' ? opts.status : (err && (err.status || err.statusCode)) || 500
  const payload = {
    message: err && err.message ? err.message : String(err),
    name: err && err.name ? err.name : 'Error',
    // thêm stack khi chạy trong dev (tuỳ chỉnh nếu cần)
    ...(process.env.NODE_ENV !== 'production' && err && err.stack ? { stack: err.stack } : {}),
  }
  return createApiResponse(payload, { status, statusCode: status, object: opts.object || 'Error' })
}

module.exports = { createApiResponse, isApiResponse, createErrorResponse }
