const express = require('express')
const router = express.Router()
const createError = require('http-errors')

const User = require('../models/user.model')
const Profile = require('../models/profile.model')
const { registerSchema, loginSchema } = require('../utilities/validation')
const { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, unsignToken } = require('../utilities/jwt')

const client = require('../config/init.redis')
const githubRouter = require('./github.route')

router.post('/register', async (req, res, next) => {
    console.log(req.body)
    try {
        // check if the request body is complete
        const result = await registerSchema.validateAsync(req.body)

        // check if user with email already exists
        const doesExist = await User.findOne({ email: result.email })
        if (doesExist)
            throw createError.Conflict(`${result.email} is already being used.`)

        // create a new user
        const user = new User(result)
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        const refreshToken = await signRefreshToken(savedUser.id)

        // create a new profile for the user
        const profile = new Profile({ user: savedUser.id })
        await profile.save()

        res.send({ accessToken, refreshToken })
    } catch (err) {
        if (err.isJoi === true)
            return next(createError.BadRequest())
        next(err)
    }
})

router.post('/login', async (req, res, next) => {
    try {
        // check if the request body is complete
        const result = await loginSchema.validateAsync(req.body)

        // check if user with email already exists
        const user = await User.findOne({ email: result.email })
        if (!user)
            throw createError.NotFound('User not found.')

        // check if password is correct
        const isMatch = await user.isValidPassword(result.password)
        if (isMatch === false)
            throw createError.Unauthorized('Username or password is incorrect.')

        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)

        res.send({ accessToken, refreshToken })
    } catch (err) {
        if (err.isJoi === true)
            return next(createError.BadRequest('Invalid username or password.'))
        next(err)
    }
})

router.post('/refresh-token', verifyAccessToken, async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken)
            throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)

        const accessToken = await signAccessToken(userId)
        const refToken = await signRefreshToken(userId)

        res.send({ accessToken: accessToken, refreshToken: refToken })
    } catch (err) {
        next(err)
    }
})

router.delete('/logout', verifyAccessToken, async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken)
            throw createError.BadRequest()
        const userId = await verifyRefreshToken(refreshToken)
        client.sendCommand(['DEL', userId], (err, value) => {
            if (err) {
                console.log(err.message)
                throw createError.InternalServerError()
            }
        })
        // blacklist access token
        // const accessToken = req.headers['authorization'].split(' ')[1]
        // unsignToken(accessToken)
        console.log('Deleted from redis')
        // send message successfully logged out
        message = 'Successfully logged out.'
        res.send({ message })
        res.sendStatus(204)
    } catch (err) {
        next(err)
    }
})

// router.get('/github', githubRouter)

module.exports = router