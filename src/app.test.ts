import mongoose from 'mongoose'
import request from 'supertest'
import app from './app'
import UserModel, { User } from './models/User'
import existingUsers from './service/__tests__/users.json'

describe('exercise api', () => {
  const newUsername = 'new_user'

  beforeAll(async () => {
    await UserModel.init()
  })

  afterAll(async () => {
    mongoose.connection.close()
  })

  beforeEach(async () => {
    await UserModel.deleteMany({})
    await UserModel.create(existingUsers)
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
})
