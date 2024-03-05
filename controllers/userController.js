const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const asyncHandler = require('express-async-handler')
const { body, validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.signupGET = (req, res, next) => {
    res.json('GET - signup page')
}

exports.signupPOST = [
    body('username').notEmpty().trim().escape().withMessage('username required'),
    body('password').notEmpty().trim().escape().withMessage('password required'),

    body('confirmPassword')
        .notEmpty()
        .trim()
        .custom((value, { req }) => {
            return value = req.body.password
        })
        .escape()
        .withMessage('passwords do not match'),

        asyncHandler(async (req, res, next) => {
            const jsonResponses = {
                usernameError: null,
                passwordError: null,
                confirmPasswordError: null
            }

            const errors = validationResult(req)

            const newUser = new User({
                username: req.body.username,
                password: req.body.password,
                isModerator: req.body.isModerator ? req.body.isModerator : false
            })

            const { username } = newUser

            if(!errors.isEmpty()){

                const errorsArray = errors.array()
                
                errorsArray.forEach((error) => {
                    if(error.path === 'username'){
                        jsonResponses.usernameError = `*${error.msg}`
                    } else if ( error.path === 'password') {
                        jsonResponses.passwordError = `*${error.msg}`
                    } else {
                        jsonResponses.confirmPasswordError = `*${error.msg}`
                    }
                })
                return res.json(jsonResponses)
            } else {
                try {
                    const checkDuplicate = await User.findOne({username})

                    if(checkDuplicate){
                        jsonResponses.usernameError = 'Username already exists.'
                        return res.json(jsonResponses)
                    }

                    const hashedPassword = await bcrypt.hash(req.body.password, 10)
                    newUser.password = hashedPassword
                    await newUser.save()
                    return res.send('sign up successful')
                } catch(err){
                    return next(err)
                }
            }
        })
    
    ]

    exports.loginGET = (req, res) => {
        res.json('GET - login page')
    }

    exports.loginPOST = [
        body('username').notEmpty().trim().escape().withMessage('please enter a username'),
        body('password').notEmpty().trim().escape().withMessage('please enter your passwword'),
        
        asyncHandler(async(req, res, next) => {
            
            const jsonResponses = {
                usernameError: null,
                passwordError: null
            }

            const errors = validationResult(req)

            if(!errors.isEmpty()){
                // console.log('in here')
                const errorsArray = errors.array()
                errorsArray.forEach((error)=>{
                    if(error.path === 'username'){
                        jsonResponses.usernameError = `*${error.msg}`
                    } else {
                        jsonResponses.passwordError = `*${error.msg}`
                    }

                })
                return res.json(jsonResponses)
            } else {
                console.log('in here')
                const user = await User.find({username: req.body.username})
                console.log(user)
                if(!user[0]){
                    console.log('user error')
                    jsonResponses.usernameError = '*user does not exist'
                    return res.json(jsonResponses)
                }
                console.log('we are here')
                const match = await bcrypt.compare(req.body.password, user[0].password)
                if(!match){
                    console.log('password error')
                    jsonResponses.passwordError = '*incorrect password'
                    return res.json(jsonResponses)
                }

                console.log('here')

                jwt.sign({user}, process.env.SECRET_KEY, {expiresIn: '1hr', algorithm: 'HS256'},
                (err, token) => {
                    if(err){
                        console.log('jwt error')
                        throw new Error(err)
                    } else {
                        console.log('sign successful')
                        const {username, isModerator } = user
                        return res.json({username, isModerator, Bearer: `Bearer ${token}`})
                    }
                })
            }

        })
    ]

 exports.GETposts = asyncHandler(async (req, res) => {
    const posts = await Post.find({isPublished: true})
    .populate('comments')
    .populate('author')
    .sort({timestamp: -1})
    




    return res.json(posts)
 })  
 
 exports.GETpostbyid = asyncHandler(async(req, res) => {
    const post = await Post.findById(req.params.id)
    .populate({
        path: 'comments',
        options: {sort: {timestamp: -1}}
 }).populate('author')
    .exec()

    res.json(post)
 })

 exports.POSTcomment = [

    body('newComment').notEmpty().trim().escape().withMessage('comment must contain text'),

    asyncHandler(async(req, res) => {

        const currentUser = req.user

        const [author, post] = await Promise.all([
            User.findById(currentUser._id),
            Post.findById(req.params.id)
            .populate('author', 'username')
            .populate({path: 'comments',
                populate: {path: 'author', select: ['username', 'isModerator']}   
        })
        ])


        const errors = validationResult(req)

        if(!errors.isEmpty()){

            res.json(errors)
        } else {

            const newComment = new Comment({
                author,
                message: req.body.newComment,

            })
            await newComment.save()

            post.comments.push(newComment)

            await post.save()

            res.json(post)


        }

    })

 ]