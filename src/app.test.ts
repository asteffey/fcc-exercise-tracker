import mongoose from 'mongoose'
import request from 'supertest'
import app from './app'
import UserModel from './models/User'

describe('exercise api', () => {
  const newUsername = 'new_user'

  beforeAll(async () => {
    await UserModel.init()
  })

  afterAll(async () => {
    mongoose.connection.close()
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
})
