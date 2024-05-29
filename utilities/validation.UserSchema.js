const Joi = require('@hapi/joi');

const UserSchema = Joi.object({
    name: Joi.string().required().max(100),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin').default('user')
});

module.exports = {
    UserSchema
}