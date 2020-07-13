import ExerciseModel, { Exercise } from '../models/Exercise'
import UserModel, { User } from '../models/User'
import handleValidationError from './handleValidationErrorDecorator'
import propertyOf from '../util/propertyOf'
import { Types } from 'mongoose'
import RestError from './RestError'
import checkExists from '../util/checkExists'

interface NewExercise {
  userId?: string
  type?: string
  description?: string
  duration?: string
  when?: string
}

function validate<T> (field: keyof Exercise | keyof User, value: T | undefined) {
  return checkExists(() => new RestError(`${field} must be specified`))(value)
}

function toValidObjectId (field: keyof Exercise | keyof User, value: string | undefined) {
  try {
    return new Types.ObjectId(validate(field, value))
  } catch (error) {
    throw new RestError(`${field} invalid: ${error.message}`)
  }
}

export async function addExercise ({ userId, type, description, duration, when }: NewExercise) {
  return await handleValidationError(async () => {
    const exercise = await ExerciseModel.create({
      userId: Types.ObjectId(validate('userId', userId)),
      type: validate('type', type),
      description: validate('description', description),
      duration: Number(validate('duration', duration)),
      when: Number(when) || Date.parse(when as string) || Date.now()
    })
    await exercise.populate(propertyOf<Exercise>('userId')).execPopulate()

    return {
      username: (exercise.userId as User).username,
      type: exercise.type,
      description: exercise.description,
      duration: exercise.duration,
      when: exercise.when
    }
  })
}

interface LogRequest {
  userId?: string
}

export async function getLog ({ userId }: LogRequest) {
  return handleValidationError(async () => {
    const id = toValidObjectId('userId', userId)
    const [user, exercises] = await Promise.all([
      UserModel.findById(userId)
        .then(checkExists(() => new RestError(`userId ${userId} not found`, 404))),
      ExerciseModel.find({ userId: id })
    ])

    return {
      _id: user._id.toString(),
      username: user.username,
      count: exercises.length,
      log: exercises.map(({ type, description, duration, when }) => ({
        type,
        description,
        duration,
        when
      }))
    }
  })
}
