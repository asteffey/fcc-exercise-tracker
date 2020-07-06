import cors from 'cors'
import express from 'express'
import { urlencoded } from 'body-parser'
import { newUser } from './controller/User'
import './db'

const app = express()

app.use(cors({ optionsSuccessStatus: 200 }))
app.use(urlencoded({ extended: false }))
app.use(express.static('public'))

app.post('/api/exercise/new-user', newUser)

export default app
