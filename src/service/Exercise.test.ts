import mongoose from 'mongoose'
import * as Exercise from './Exercise'
import ExerciseModel from '../models/Exercise'
import '../db'
import existingExercises from './__tests__/exercises.json'
import existingUsers from './__tests__/users.json'
import UserModel from '../models/User'

describe('Exercise Service', () => {
  const newExercise = {
    userId: existingUsers[0]._id,
    type: 'coding',
    description: 'coding an exercise tracker',
    duration: '50',
    timestamp: '2020-07-09'
  }

  beforeAll(async () => {
    await ExerciseModel.init()
    try {
      const x = 1 + 1
      expect(x).toEqual(2)
    } catch {
      console.log('foo')
    }
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

  it.each([
    'userId',
    'type',
    'description',
    'duration'
  ])('complains about a missing %s key', async (missingVariable) => {
    const missing = {
      ...newExercise,
      [missingVariable]: undefined
    }
    const exercise = Exercise.addExercise(missing)

    await expect(exercise).rejects.toEqual(expect.objectContaining({
      message: expect.stringContaining(missingVariable),
      code: 400
    }))
  })

  it.each([
    ['', 400],
    [undefined, 400],
    ['BAD', 400],
    ['000000000000000000000000', 404] // non-existent user
  ])('returns error when log requested with invalid userId \'%s\'', async (badUserId, code) => {
    const exercises = Exercise.getLog({ userId: badUserId })

    await expect(exercises).rejects.toEqual(expect.objectContaining({
      message: expect.stringContaining('userId'),
      code
    }))
  })

  it('returns empty when log user has no exercises', async () => {
    const userId = existingUsers[2]._id
    const { _id, username, count, log } = await Exercise.getLog({ userId })

    expect(_id).toEqual(userId)
    expect(username).toEqual(existingUsers[2].username)
    expect(count).toEqual(0)
    expect(log).toHaveLength(0)
  })
})
