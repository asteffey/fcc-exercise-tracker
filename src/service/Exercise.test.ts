import mongoose from 'mongoose'
import * as Exercise from './Exercise'
import ExerciseModel from '../models/Exercise'
import '../db'
import existingExercises from './__tests__/exercises.json'
import existingUsers from './__tests__/users.json'

describe('Exercise Service', () => {
  const newExercise = {
    userId: existingUsers[0]._id,
    type: 'coding',
    description: 'coding an exercise tracker',
    duration: '50',
    when: '2020-07-09'
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
    await ExerciseModel.deleteMany({})
    await ExerciseModel.create(existingExercises)
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
})
