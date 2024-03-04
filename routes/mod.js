const express = require('express')
const router = express.Router()
const modController = require('../controllers/modController')

router.post('/login', modController.loginPOST)

router.get('/posts', modController.GETposts)

router.post('/posts/:id', modController.postUPDATE)


module.exports = router
