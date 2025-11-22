/**
 * Middleware wrapper cho validation
 * Giúp code route sạch hơn và dễ maintain
 */

/**
 * Tạo middleware validation từ một validation function
 * @param {Function} validationFn - Hàm validation (async)
 * @returns {Function} Express middleware
 */
export const validate = validationFn => {
  return async (req, res, next) => {
    try {
      await validationFn(req.body)
      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Validate cho params
 */
export const validateParams = validationFn => {
  return async (req, res, next) => {
    try {
      await validationFn(req.params)
      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Validate cho query
 */
export const validateQuery = validationFn => {
  return async (req, res, next) => {
    try {
      await validationFn(req.query)
      next()
    } catch (error) {
      next(error)
    }
  }
}
