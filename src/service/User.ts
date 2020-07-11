import User from '../models/User'
import RestError from './RestError'

const DUPLICATE_KEY_ERROR = 11000

interface NewUserRequest {
    username: string
}

export async function newUser ({ username }: NewUserRequest) {
  try {
    const { _id } = await User.create({ username })
    return {
      _id: _id.toString(),
      username
    }
  } catch (err) {
    if (err.code === DUPLICATE_KEY_ERROR) {
      throw new RestError(`username ${username} already exists`, 400)
    } else if (err.name === 'ValidationError') {
      throw new RestError(`username ${username} must begin with a letter and be between 6 and 16 characters`, 400)
    } else {
      throw err
    }
  }
}

export async function allUsers () {
  const users = await User.find({})

  return users.map(
    ({ _id, username }) => ({ _id, username })
  )
}
