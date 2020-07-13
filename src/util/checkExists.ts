interface ErrorFactory {
  (): Error
}

const defaultErrorFactory: ErrorFactory = () => new Error()

function checkExists (errorFactory: ErrorFactory = defaultErrorFactory) {
  return <T> (obj: T | null | undefined): T => {
    if (obj === null || obj === undefined) {
      throw errorFactory()
    } else {
      return obj
    }
  }
}

export default checkExists
