const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')

require('dotenv').config()
require('./config/init.mongodb')
require('./config/init.redis')

const authRoute = require('./routes/auth.route')
const githubRoute = require('./routes/github.route')
const profileRoute = require('./routes/profile.route')

const { verifyAccessToken } = require('./utilities/jwt')


const app = express()
app.use(morgan('dev'))
app.use(express.json())

app.get('/', verifyAccessToken, async (req, res, next) => {
    res.send('Hello World')
})

app.use('/auth', authRoute)
app.use('/auth/github', githubRoute)
app.use('/profile', profileRoute)

app.use(async (req, res, next) => {
    next(createError.NotFound())
})

app.use((err, req, res, next) => {
    // check if response headers have been sent
    if (res.headersSent)
        return
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})