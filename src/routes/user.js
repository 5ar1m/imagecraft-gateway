const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('user details');
});

router.post('/signin', (req, res) => {
  res.send('user created');
});

router.post('/login', (req, res) => {
    res.send('user logged in');
});

router.patch('/update', (req, res) => {
    res.send('user data updated');
});

module.exports = router;