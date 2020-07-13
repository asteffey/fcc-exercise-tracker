import cors from 'cors'
import express from 'express'
import { urlencoded } from 'body-parser'
import { allUsers, newUser } from './service/User'
import { addExercise, getLog } from './service/Exercise'
import './db'
import handleErrors from './restErrorHandlerDecorator'

const app = express()

app.use(cors({ optionsSuccessStatus: 200 }))
app.use(urlencoded({ extended: false }))
app.use(express.static('public'))

app.post('/api/exercise/new-user', handleErrors(async ({ body }, response) => {
  const user = await newUser(body)
  response.json(user)
}))

app.get('/api/exercise/users', handleErrors(async (_, response) => {
  const users = await allUsers()
  response.json(users)
}))

app.post('/api/exercise/add', handleErrors(async ({ body }, response) => {
  const exercise = await addExercise(body)
  response.json(exercise)
}))

app.get('/api/exercise/log', handleErrors(async ({ query }, response) => {
  const exercises = await getLog(query)
  response.json(exercises)
}))

export default app
