const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    bio: {
        type: String
    },
    phone: {
        type: String
    },
    photo: {
        type: String
    },
    visibility: {
        type: String,
        default: 'private',
        enum: ['public', 'private']
    },
}, {
    timestamps: true
});

const Profile = mongoose.model('profile', ProfileSchema);
module.exports = Profile;