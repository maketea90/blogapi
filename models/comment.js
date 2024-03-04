const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CommentSchema = new Schema({
    message: {type: String},
    timestamp: {type: Date, default: Date.now},

})

module.exports = mongoose.model('Comment', CommentSchema)
