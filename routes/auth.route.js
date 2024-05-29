const express = require('express')
const router = express.Router()
const createError = require('http-errors')

const User = require('../models/user.model')
const { UserSchema } = require('../utilities/validation.UserSchema')
const { signAccessToken } = require('../utilities/jwt')


router.post('/register', async (req, res, next) => {
    console.log(req.body)
    try {
        // check if the request body is complete
        const result = await UserSchema.validateAsync(req.body)
        console.log(result)

        // check if user with email already exists
        const doesExist = await User.findOne({ email: result.email })
        if (doesExist)
            throw createError.Conflict(`${result.email} is already being used.`)

        // create a new user
        const user = new User(result)
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)

        res.send(accessToken)
    } catch (err) {
        if (err.isJoi === true) error.status = 422
        next(err)
    }
})

router.post('/login', async (req, res, next) => {
    res.send('Login')
})

router.post('/refresh-token', async (req, res, next) => {
    res.send('Refresh Token')
})

router.delete('/logout', async (req, res, next) => {
    res.send('Logout')
})







module.exports = router