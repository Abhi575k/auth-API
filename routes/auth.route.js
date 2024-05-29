const express = require('express')
const router = express.Router()
const createError = require('http-errors')

const User = require('../models/user.model')
const { registerSchema, loginSchema } = require('../utilities/validation')
const { signAccessToken, signRefreshToken } = require('../utilities/jwt')


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
        if (!isMatch)
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

router.post('/refresh-token', async (req, res, next) => {
    res.send('Refresh Token')
})

router.delete('/logout', async (req, res, next) => {
    res.send('Logout')
})

module.exports = router