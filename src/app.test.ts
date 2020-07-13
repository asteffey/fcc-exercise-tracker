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

describe('exercise api', () => {
  const newUsername = 'new_user'
  const mockNow = 1234
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
      when: '2020-07-09'
    }

    const { body, status } = await request(app)
      .post('/api/exercise/add')
      .send(urlEncoded(data))

    expect(status).toEqual(200)
    expect(body).toMatchObject({
      username: existingUsers[0].username,
      type: data.type,
      description: data.description,
      duration: Number(data.duration),
      when: Date.parse(data.when)
    })
  })

  it('adds an exercise without a date', async () => {
    const data = {
      userId: existingUsers[0]._id,
      type: 'coding',
      description: 'coding an exercise tracker',
      duration: '50'
    }

    const { body, status } = await request(app)
      .post('/api/exercise/add')
      .send(urlEncoded(data))

    expect(status).toEqual(200)
    expect(body).toMatchObject({
      username: existingUsers[0].username,
      type: data.type,
      description: data.description,
      duration: Number(data.duration),
      when: mockNow
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
      count: 3,
      log: existingExercises
        .filter(exercise => exercise.userId === userId)
        .map(({ description, duration, type, when }) => ({
          description,
          duration,
          type,
          when
        }))
    }))
  })
})
