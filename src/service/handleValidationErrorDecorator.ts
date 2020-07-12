import RestError from './RestError'

async function handleValidationErrorDecorator<T> (func: { (): T }) {
  try {
    return await func()
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.keys(error.errors).map(field => `${field}: ${error.errors[field].message}`).join('\n')
      throw new RestError(message, 400)
    } else {
      throw error
    }
  }
}

export default handleValidationErrorDecorator
