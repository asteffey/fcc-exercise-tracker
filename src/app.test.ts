import mongoose from 'mongoose'
import request from 'supertest'
import app from './app'
import UserModel, { User } from './models/User'
import ExerciseModel from './models/Exercise'
import existingUsers from './service/__tests__/users.json'
import existingExercises from './service/__tests__/exercises.json'

function urlEncoded (obj: any) {
  return Object.keys(obj).map(key =>
    `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
  ).join('&')
}

// @ts-ignore
const toReturnedExercise = ({ description, duration, date }) => ({
  description,
  duration,
  date: new Date(date).toDateString()
})

describe('exercise api', () => {
  const newUsername = 'new_user'
  const mockNow = 1
  const mockDate = 'Thu Jan 01 1970'
  const realNow = global.Date.now

  beforeAll(async () => {
    await UserModel.init()
    // @ts-ignore
    global.Date.now = jest.fn(() => mockNow)
  })

  afterAll(async () => {
    await mongoose.connection.close()
    global.Date.now = realNow
  })

  beforeEach(async () => {
    await UserModel.create(existingUsers)
    await ExerciseModel.create(existingExercises)
  })

  afterEach(async () => {
    await ExerciseModel.deleteMany({})
    await UserModel.deleteMany({})
  })

  it('creates a new user', async () => {
    const { body } = await request(app)
      .post('/api/exercise/new-user')
      .send(`username=${newUsername}`)

    expect(body.username).toEqual(newUsername)
    expect(body._id).toBeDefined()
  })

  it('returns error if username already exists', async () => {
    const existing = existingUsers[0].username
    const { status, text } = await request(app)
      .post('/api/exercise/new-user')
      .send(`username=${existing}`)

    expect(text).toEqual(expect.stringContaining(existing))
    expect(status).toBeDefined()
  })

  it('gets all Users', async () => {
    const { body } = await request(app)
      .get('/api/exercise/users')

    const existingUsernames = existingUsers.map(user => user.username)
    body.forEach(({ username }: User) => {
      expect(existingUsernames).toContain(username)
    })
  })

  it('adds an exercise with a date', async () => {
    const data = {
      userId: existingUsers[0]._id,
      type: 'coding',
      description: 'coding an exercise tracker',
      duration: '50',
      date: '2020-01-15'
    }

    const { body, status } = await request(app)
      .post('/api/exercise/add')
      .send(urlEncoded(data))

    expect(status).toEqual(200)
    expect(body).toMatchObject({
      _id: data.userId,
      username: existingUsers[0].username,
      description: data.description,
      duration: Number(data.duration),
      date: 'Wed Jan 15 2020'
    })
  })

  it('adds an exercise without a date', async () => {
    const data = {
      userId: existingUsers[0]._id,
      description: 'coding an exercise tracker',
      duration: '50'
    }

    const { body, status } = await request(app)
      .post('/api/exercise/add')
      .send(urlEncoded(data))

    expect(status).toEqual(200)
    expect(body).toMatchObject({
      _id: data.userId,
      username: existingUsers[0].username,
      description: data.description,
      duration: Number(data.duration),
      date: mockDate
    })
  })

  it('returns full exercise log', async () => {
    const userId = existingUsers[0]._id
    const { body, status } = await request(app)
      .get(`/api/exercise/log?userId=${userId}`)

    expect(status).toEqual(200)
    expect(body).toEqual(expect.objectContaining({
      _id: userId,
      username: existingUsers[0].username,
      count: 5,
      log: existingExercises
        .slice(0, 5)
        .map(toReturnedExercise)
    }))
  })

  it('returns filtered exercise log with from and to', async () => {
    const userId = existingUsers[0]._id
    const from = '2020-01-01'
    const to = '2020-01-02'
    const { body, status } = await request(app)
      .get(`/api/exercise/log?userId=${userId}&from=${from}&to=${to}`)

    expect(status).toEqual(200)
    expect(body).toEqual(expect.objectContaining({
      _id: userId,
      username: existingUsers[0].username,
      count: 2,
      log: existingExercises
        .slice(0, 2)
        .map(toReturnedExercise)
    }))
  })
})
