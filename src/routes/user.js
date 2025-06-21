const express = require('express');
const router = express.Router();
const {signIn} = require('../controllers/user')

router.post('/signin', signIn);

router.post('/login', (req, res) => {
    res.send('user logged in');
});

module.exports = router;