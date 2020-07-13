import { Schema, model, Document, Types } from 'mongoose'
import { User } from './User'

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  when: { type: Number, required: true }
})

export interface Exercise extends Document {
  userId: string | Types.ObjectId | User,
  type: string,
  description: string,
  duration: number,
  when: number
}

export default model<Exercise>('Exercise', schema)
