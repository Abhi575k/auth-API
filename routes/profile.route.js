const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const { check, validationResult } = require('express-validator');

const Profile = require('../models/profile.model')
const User = require('../models/user.model')

const { verifyAccessToken } = require('../utilities/jwt')
const upload = require('../config/multer')

router.get('/', verifyAccessToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.payload.aud)
        if (!user)
            throw createError.NotFound('User not found.')
        if (user.isAdmin() === true) {
            const profiles = await Profile.find().populate('user', 'name email')
            return res.send(profiles)
        } else {
            const profiles = await Profile.find({ visibility: 'public' }).populate('user', 'name email')
            return res.send(profiles)
        }
    } catch (err) {
        next(err)
    }
})

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
        const allowedProfileUpdates = ['bio', 'phone', 'visibility']
        const allowedUserUpdates = ['name', 'email']
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedProfileUpdates.includes(update) || allowedUserUpdates.includes(update))
        // sepaarate update sfor user and profile
        const profileUpdates = updates.filter(update => allowedProfileUpdates.includes(update))
        const userUpdates = updates.filter(update => allowedUserUpdates.includes(update))
        if (!isValidOperation)
            throw createError.BadRequest('Invalid updates.')
        const profile = await Profile.findOne({ user: req.payload.aud })
        const user = await User.findById(req.payload.aud)
        if (!profile)
            throw createError.NotFound('Profile not found.')
        if (!user)
            throw createError.NotFound('User not found.')
        profileUpdates.forEach(update => profile[update] = req.body[update])
        userUpdates.forEach(update => user[update] = req.body[update])
        await profile.save()
        await user.save()
        res.send(profile)
    } catch (err) {
        next(err)
    }
})

router.patch('/update/password', verifyAccessToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.payload.aud)
        if (!user)
            throw createError.NotFound('User not found.')
        oldPass = req.body.oldPassword
        pass1 = req.body.password1
        pass2 = req.body.password2
        if (!oldPass || !pass1 || !pass2)
            throw createError.BadRequest('All fields are required.')
        const isMatch = await user.isValidPassword(oldPass)
        if (isMatch === false)
            throw createError.BadRequest('Invalid password.')
        if (pass1 !== pass2)
            throw createError.BadRequest('Passwords do not match.')
        user.password = pass1
        await user.save()
        res.send(user)
    } catch (err) {
        next(err)
    }
})

// updating profile picture
router.patch('/update/photo/upload', [verifyAccessToken, upload.single('photo')], async (req, res, next) => {
    if (!req.file)
        throw createError.BadRequest('Please upload a file.')
    try {
        const profile = await Profile.findOne({ user: req.payload.aud })
        if (!profile)
            throw createError.NotFound('Profile not found.')
        profile.photo = req.file.buffer
        await profile.save()
        res.send(profile)
    } catch (err) {
        next(err)
    }
})

// updating profile picture using URL
router.patch('/update/photo/url', [verifyAccessToken, [check('photo', 'Photo URL is required').isURL(),]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })
    try {
        const profile = await Profile.findOne({ user: req.payload.aud })
        if (!profile)
            return res.status(404).json({ msg: 'Profile not found' })
        profile.photo = req.body.photo
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


// router.patch('/update/picture/delete', verifyAccessToken, async (req, res, next) => {

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
