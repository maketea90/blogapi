const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PostSchema = new Schema({
    title: {type: String},
    message: {type: String},
    timestamp: {type: Date, default: Date.now},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    published: {type: Boolean, default: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
})

module.exports = mongoose.model('Post', PostSchema)