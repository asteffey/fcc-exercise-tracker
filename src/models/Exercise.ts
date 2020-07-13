import { Schema, model, Document, Types } from 'mongoose'
import { User } from './User'

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  timestamp: { type: Number, required: true }
})

export interface Exercise extends Document {
  userId: string | Types.ObjectId | User,
  description: string,
  duration: number,
  timestamp: number
}

export default model<Exercise>('Exercise', schema)
