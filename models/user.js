const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {type: String},
    password: {type: String},
    isModerator: {type: Boolean, default: false}
})

module.exports = mongoose.model('User', UserSchema)