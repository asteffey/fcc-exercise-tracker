import User from '../models/User'
import { NextFunction, Response } from 'express'

const DUPLICATE_KEY_ERROR = 11000

interface NewUserRequest {
  body: {
    username: string
  }
}

export async function newUser ({ body: { username } }: NewUserRequest, response: Response, next: NextFunction) {
  try {
    const { _id } = await User.create({ username })
    response.json({
      _id: _id.toString(),
      username
    })
  } catch (err) {
    if (err.code === DUPLICATE_KEY_ERROR) {
      response.status(400)
      response.send(`username ${username} already exists`)
    } else if (err.name === 'ValidationError') {
      response.status(400)
      response.send(`username ${username} must begin with a letter and be between 6 and 16 characters`)
    } else {
      next(err)
    }
  }
}

export async function allUsers (_: any, response: Response, next: NextFunction) {
  try {
    const users = await User.find({})
    response.json(users.map(
      ({ _id, username }) => ({ _id, username })
    ))
  } catch (err) {
    next(err)
  }
}
