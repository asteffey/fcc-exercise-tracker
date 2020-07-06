import mongoose from 'mongoose'
import { mongoUrl } from './config'

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const db = mongoose.connection
db.on('error', (err) => console.error(`MongoDB connection error: ${err}`))

function close () {
  console.log('MongoDB Closed')
}

process.on('SIGINT', close)
process.on('SIGTERM', close)
