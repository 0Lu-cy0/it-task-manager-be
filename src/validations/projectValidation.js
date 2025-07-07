import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'

const createNew = async (req, res, next) => {
  const trueCondition = Joi.object({
    tittle: Joi.string().required().min(5).max(50).trim().strict().messages({
      'any.required': 'Title is required(by Cat2004)',
      'string.empty': 'Title is not allowed to be empty(by Cat2004)',
      'string.min': 'Title min 3 chars(by Cat2004)',
      'string.max': 'Title max 50 chars(by Cat2004)',
      'string.trim': 'Title must not have leading or trailing whitespace(by Cat2004)',
    }),
    content: Joi.string().required().min(5).max(300).trim().strict(),
  })

  try {
    await trueCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message,
    })
  }
}


export const projectValidation = {
  createNew,
}

