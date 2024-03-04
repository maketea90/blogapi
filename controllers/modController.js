const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const asyncHandler = require('express-async-handler')
const { body, validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const he = require('he')

exports.loginPOST = [
    body('username').notEmpty().trim().escape().withMessage('please enter a username'),
    body('password').notEmpty().trim().escape().withMessage('please enter a password'),

    asyncHandler(async (req, res) => {
        
        const jsonResponses = {
            usernameError: null,
            passwordError: null
        }
        
        const errors = validationResult(req)
        
        if(!errors.isEmpty()){

            const errorArray = errors.array()

            errorArray.forEach((error) => {
                if(error.path === 'username'){
                    jsonResponses.usernameError = `*${error.msg}`
                } else {
                    jsonResponses.passwordError = `*${error.msg}`
                }
            })

            return res.json(jsonResponses)
        } else {
            const user = await User.find({username: req.body.username})

            if(!user){
                jsonResponses.usernameError = `*user doesn't exist`
                return res.json(jsonResponses)
            }

            if(!user.isModerator){
                jsonResponses.usernameError = `*user is not a moderator`
                return res.json(jsonResponses)
            }

            const match = await bcrypt.compare(user.password, req.body.password)

            if(!match){
                jsonResponses.passwordError = `*incorrect password`
                return res.json(jsonResponses)
            }

            jwt.sign({user}, process.env.SECRET_KEY, {expiresIn: '1hr', algorithm: 'HS256'}, (err, token) => {
                if(err){
                    throw new Error(err)
                } else {
                    const { username, isModerator} = user
                    return res.json({username, isModerator, Bearer: `Bearer ${token}`})
                }
            })
        }
    })
]

exports.GETposts = asyncHandler(async(req, res) => {
    const posts = await Post.find().populate('comments')
    .populate('author')
    .sort({timestamp: -1})
    res.json(posts)
})


exports.postUPDATE = [

    body('published').escape(),

    asyncHandler(async(req, res) => {

    const post = await Post.findById(req.params.id)

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        res.json({
            title: he.decode(post.title),
            message: he.decode(post.message),
            published: req.body.published
        })
    } else {
        post.published = req.body.published
        await post.save()

        return res.json(post)
    }

})]