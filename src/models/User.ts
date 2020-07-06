import { Schema, model, Document } from 'mongoose'

const schema = new Schema({
  username: { type: String, required: true, unique: true, validate: /^[A-Za-z][a-zA-Z0-9_]{5,15}$/ }
})

export interface User extends Document {
  username: string
}

export default model<User>('User', schema)
