var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')

/* GET home page. */
router.get('/signup', userController.signupGET);

router.post('/signup', userController.signupPOST)

router.get('/login', userController.loginGET)

router.post('/login', userController.loginPOST)

router.get('/posts', userController.GETposts)

router.get('/posts/:id', userController.GETpostbyid)

router.post('/posts/:id/comments', userController.POSTcomment)



module.exports = router;
