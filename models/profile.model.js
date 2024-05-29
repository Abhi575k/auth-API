const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    bio: {
        type: String,
        default: none
    },
    phone: {
        type: String,
        default: none
    },
    photo: {
        type: String,
        default: none
    },
    visibility: {
        type: String,
        default: 'private',
        enum: ['public', 'private']
    },
}, {
    timestamps: true
});