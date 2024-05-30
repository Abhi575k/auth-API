const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    githubID: {
        type: String,
        default: null
    },
    password: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
    } catch (err) {
        next(err)
    }
})

UserSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (err) {
        throw err
    }
}

UserSchema.methods.isAdmin = async function () {
    return this.role === 'admin'
}

const User = mongoose.model('user', UserSchema);
module.exports = User;