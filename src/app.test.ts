import mongoose from 'mongoose'
import request from 'supertest'
import app from './app'
import UserModel, { User } from './models/User'
import existingUsers from './controller/__tests__/users.json'

describe('exercise api', () => {
  const newUsername = 'new_user'

  beforeAll(async () => {
    await UserModel.init()
  })

  afterAll(async () => {
    mongoose.connection.close()
  })

  beforeEach(async () => {
    await UserModel.create(existingUsers)
  })

  afterEach(async () => {
    await UserModel.deleteMany({})
  })

  it('creates a new user', async () => {
    const { body } = await request(app)
      .post('/api/exercise/new-user')
      .send(`username=${newUsername}`)

    expect(body.username).toEqual(newUsername)
    expect(body._id).toBeDefined()
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
