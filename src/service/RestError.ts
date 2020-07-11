class RestError extends Error {
  code: number

  constructor (message: string, code: number) {
    super(message)
    this.code = code
    Object.setPrototypeOf(this, RestError.prototype)
  }
}

export default RestError
