const express = require('express');
const router = express.Router();
const {signIn, logIn, logOut} = require('../controllers/user');
const authenticate = require('../middlewares/auth');

router.post('/signin', signIn);

router.post('/login', logIn);

router.post('/logout', authenticate, logOut);

module.exports = router;