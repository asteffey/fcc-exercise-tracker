import mongoose from 'mongoose'
import * as User from './User'
import UserModel from '../models/User'
import '../db'
import { NextFunction, Response } from 'express'

describe('new-user', () => {
  const newUsername = 'new_user'
  const existingUser = {
    username: 'existing_user'
  }
  let response: Response
  let next: NextFunction

  beforeAll(async () => {
    await UserModel.init()
  })

  afterAll(async () => {
    mongoose.connection.close()
  })

  beforeEach(async () => {
    await UserModel.create(existingUser)

    response = {} as Response
    response.status = jest.fn().mockReturnValue(response)
    response.json = jest.fn().mockReturnValue(response)
    response.send = jest.fn().mockReturnValue(response)

    next = jest.fn()
    next(null)
  })

  afterEach(async () => {
    await UserModel.deleteMany({})
  })

  it('foo', () => {
    expect(2 + 3).toBe(5)
  })

  it('creates a new unique user', async () => {
    await User.newUser({ body: { username: newUsername } }, response, next)

    expect(response.json).toBeCalledTimes(1)
    const { _id, username } = (response.json as jest.Mock).mock.calls[0][0]
    expect(typeof _id).toBe('string')
    expect(username).toBe(newUsername)
  })

  it('returns error is username already exists', async () => {
    await User.newUser({ body: { username: existingUser.username } }, response, next)

    expect(response.status).toBeCalledTimes(1)
    expect(response.status).toBeCalledWith(400)
    expect(response.send).toBeCalledTimes(1)
    expect(response.send).toBeCalledWith(expect.stringMatching(new RegExp(`${existingUser.username} already exists`)))
  })
})
