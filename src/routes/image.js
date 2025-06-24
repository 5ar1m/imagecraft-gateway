const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {handleUpload, uploadImage} = require('../controllers/image');

router.post('/upload', auth, handleUpload, uploadImage);

module.exports = router;