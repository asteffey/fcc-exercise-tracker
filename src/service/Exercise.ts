import ExerciseModel, { Exercise } from '../models/Exercise'
import UserModel, { User } from '../models/User'
import handleValidationError from './handleValidationErrorDecorator'
import propertyOf from '../util/propertyOf'
import { Types } from 'mongoose'
import RestError from './RestError'
import checkExists from '../util/checkExists'
import moment from 'moment'

interface NewExercise {
  userId?: string
  type?: string
  description?: string
  duration?: string
  date?: string
}

function validate<T> (field: keyof Exercise | keyof User, value: T | undefined) {
  return checkExists(() => new RestError(`${field} must be specified`))(value)
}

function toValidDate (date: string | undefined) {
  const parsed = moment.utc(date, 'YYYY-MM-DD')
  if (parsed.isValid()) {
    return parsed
  } else {
    return Date.now()
  }
}

function toValidObjectId (field: keyof Exercise | keyof User, value: string | undefined) {
  try {
    return new Types.ObjectId(validate(field, value))
  } catch (error) {
    throw new RestError(`${field} invalid: ${error.message}`)
  }
}

function formatDate (date: Date) {
  return moment.utc(date).format('ddd MMM DD YYYY')
}

export async function addExercise ({ userId, description, duration, date }: NewExercise) {
  return await handleValidationError(async () => {
    const exercise = await ExerciseModel.create({
      userId: Types.ObjectId(validate('userId', userId)),
      description: validate('description', description),
      duration: Number(validate('duration', duration)),
      date: toValidDate(date)
    })
    await exercise.populate(propertyOf<Exercise>('userId')).execPopulate()

    const user = exercise.userId as User
    return {
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: formatDate(exercise.date)
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
      log: exercises.map(({ description, duration, date }) => ({
        description,
        duration,
        date: formatDate(date)
      }))
    }
  })
}
