import { Response, NextFunction, RequestHandler, Request } from 'express'
import RestError from './service/RestError'

function restErrorHandlerDecorator (handler: RequestHandler) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      await handler(request, response, next)
    } catch (error) {
      if (error instanceof RestError) {
        response.status(error.code)
        response.send(error.message)
      } else {
        next(error)
      }
    }
  }
}

export default restErrorHandlerDecorator
