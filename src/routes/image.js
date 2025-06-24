const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {handleUpload, uploadImage, getImage, downloadImage} = require('../controllers/image');

router.post('/', auth, handleUpload, uploadImage);

router.get('/:id', auth, getImage);

router.get('/download/:id', auth, downloadImage);

module.exports = router;