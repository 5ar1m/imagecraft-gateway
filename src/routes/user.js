const express = require('express');
const router = express.Router();
const {signIn, logIn, logOut, initiateVerification, verifyEmail} = require('../controllers/user');
const authenticate = require('../middlewares/auth');

router.post('/signin', signIn);

router.post('/login', logIn);

router.post('/logout', authenticate, logOut);

router.post('/verify', initiateVerification);

router.get('/verify/:token', verifyEmail);

module.exports = router;