// view - user can view their profile and all the public profiles
// update - user can update their profile
// delete - user can delete their profile
// admin - user can view, update, and delete all profiles

// Path: routes/profile.route.js
const express = require('express')
const router = express.Router()
const createError = require('http-errors')

const Profile = require('../models/profile.model')
const User = require('../models/user.model')

const { verifyAccessToken } = require('../utilities/jwt')

// router.get('/', verifyAccessToken, async (req, res, next) => {
//     try {
//         const user = await User.findById(req.payload.aud)
//         if (!user)
//             throw createError.NotFound('User not found.')
//         if (user.role === 'admin') {
//             const profiles = await 
//             return res.send(profiles)
//         } else {
//             const profiles = await Profile.find({ visibility: 'public' }).populate('user', 'name email')
//             return res.send(profiles)
//         }
//     } catch (err) {
//         next(err)
//     }
// })

router.get('/view', verifyAccessToken, async (req, res, next) => {
    try {
        console.log(req.payload.aud)
        const profile = await Profile.findOne({ user: req.payload.aud }).populate('user', 'name email')
        if (!profile)
            throw createError.NotFound('Profile not found.')
        res.send(profile)
    } catch (err) {
        next(err)
    }
})

router.patch('/update', verifyAccessToken, async (req, res, next) => {
    try {
        const allowedUpdates = ['name', 'bio', 'visibility']
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation)
            throw createError.BadRequest('Invalid updates.')
        const profile = await Profile.findOne({ user: req.payload.aud })
        if (!profile)
            throw createError.NotFound('Profile not found.')
        updates.forEach(update => profile[update] = req.body[update])
        await profile.save()
        res.send(profile)
    } catch (err) {
        next(err)
    }
})

router.delete('/delete', verifyAccessToken, async (req, res, next) => {
    try {
        // delete associated user
        const user = await User.findByIdAndDelete(req.payload.aud)
        // delete associated profile
        const profile = await Profile.findOneAndDelete({ user: req.payload.aud })
        if (!profile)
            throw createError.NotFound('Profile not found.')
        res.send(profile)
    } catch (err) {
        next(err)
    }
})

module.exports = router