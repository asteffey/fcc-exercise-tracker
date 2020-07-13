import mongoose from 'mongoose'
import * as User from './User'
import UserModel from '../models/User'
import '../db'
import existingUsers from './__tests__/users.json'
import ExerciseModel from '../models/Exercise'
import existingExercises from './__tests__/exercises.json'

describe('User Service', () => {
  const newUsername = 'new_user'

  beforeAll(async () => {
    await UserModel.init()
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await UserModel.create(existingUsers)
    await ExerciseModel.create(existingExercises)
  })

  afterEach(async () => {
    await ExerciseModel.deleteMany({})
    await UserModel.deleteMany({})
  })

  it('creates a new unique user', async () => {
    const { _id, username } = await User.newUser({ username: newUsername })

    expect(typeof _id).toBe('string')
    expect(username).toBe(newUsername)
  })

  it('returns error if username already exists', async () => {
    const newUser = User.newUser({ username: existingUsers[0].username })
    await expect(newUser).rejects.toEqual(expect.objectContaining({
      message: expect.stringMatching(new RegExp(`${existingUsers[0].username} already exists`)),
      code: 400
    }))
  })

  it.each([
    'short',
    '1bad',
    '_bad',
    '',
    'toolongbecauseItypetoomuch'
  ])('returns error for invalid username %p', async (username) => {
    const newUser = User.newUser({ username })
    await expect(newUser).rejects.toEqual(expect.objectContaining({
      message: expect.stringContaining('username'),
      code: 400
    }))
  })
})
