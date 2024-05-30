const JWT = require('jsonwebtoken')
const createError = require('http-errors')

const client = require('./init.redis')

require('dotenv').config()

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                name: 'access'
            }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: '1m',
                issuer: 'localhost',
                audience: userId
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                name: 'refresh'
            }
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: '1y',
                issuer: 'localhost',
                audience: userId
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    return reject(createError.InternalServerError())
                }
                client.SET(userId, token, { EX: 31536000 }, (err, reply) => {
                    if (err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                })
                resolve(token)
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization'])
            return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        // // check if token is valid
        // client.GET(token, (err, reply) => {
        //     console.log('redis fetch')
        //     if (err) {
        //         console.log(err.message)
        //         throw createError.InternalServerError()
        //     }
        //     if (reply) return next(createError.Unauthorized())
        // })
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                const userId = payload.aud
                client.GET(userId, (err, result) => {
                    if (err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                    if (refreshToken === result) return resolve(userId)
                    reject(createError.Unauthorized())
                })
                resolve(userId)
            })
        })
    },
    unsignToken: (token) => {
        client.SET(token, 'invalid', { EX: 3600 }, (err, reply) => {
            if (err) {
                console.log(err.message)
                throw createError.InternalServerError()
            }
        })
    }
}