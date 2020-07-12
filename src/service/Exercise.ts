import ExerciseModel, { Exercise } from '../models/Exercise'
import { User } from '../models/User'
import handleValidationError from './handleValidationErrorDecorator'
import propertyOf from '../util/propertyOf'

interface NewExercise {
  userId: string | undefined,
  type: string | undefined
  description: string | undefined,
  duration: string | undefined,
  when?: string | undefined
}

export async function addExercise ({ userId, type, description, duration, when }: NewExercise) {
  return await handleValidationError(async () => {
    const exercise = await ExerciseModel.create({
      userId: userId || '',
      type: type || '',
      description: description || '',
      duration: Number(duration),
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
