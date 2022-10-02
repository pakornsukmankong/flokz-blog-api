// const { sequelize } = require('./models')
// sequelize.sync({ force: true })
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const notFound = require('./middlewares/notFound')
const error = require('./middlewares/error')
const authRoute = require('./routes/authRoute')
const userRoute = require('./routes/userRoute')
const blogRoute = require('./routes/blogRoute')
const authenticate = require('./middlewares/authenticate')

const app = express()

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/auth', authRoute)
app.use('/users', authenticate, userRoute)
app.use('/blogs', authenticate, blogRoute)

app.use(notFound)
app.use(error)

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`server running on port ${port}`))
