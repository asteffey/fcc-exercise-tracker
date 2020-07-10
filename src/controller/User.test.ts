import mongoose from 'mongoose'
import * as User from './User'
import UserModel from '../models/User'
import '../db'
import { NextFunction, Response } from 'express'
import existingUsers from './__tests__/users.json'

describe('new-user', () => {
  const newUsername = 'new_user'
  let response: Response
  let next: NextFunction

  beforeAll(async () => {
    await UserModel.init()
  })

  afterAll(async () => {
    mongoose.connection.close()
  })

  beforeEach(async () => {
    await UserModel.create(existingUsers)

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

  it('returns error if username already exists', async () => {
    await User.newUser({ body: { username: existingUsers[0].username } }, response, next)

    expect(response.status).toBeCalledTimes(1)
    expect(response.status).toBeCalledWith(400)
    expect(response.send).toBeCalledTimes(1)
    expect(response.send).toBeCalledWith(expect.stringMatching(new RegExp(`${existingUsers[0].username} already exists`)))
  })

  it.each([
    'short',
    '1bad',
    '_bad',
    '',
    'toolongbecauseItypetoomuch'
  ])('returns error for invalid username %p', async (username) => {
    await User.newUser({ body: { username } }, response, next)

    expect(response.status).toBeCalledTimes(1)
    expect(response.status).toBeCalledWith(400)
  })
})
