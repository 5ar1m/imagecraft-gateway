const express = require('express');
const router = express.Router();
const {handleUpload, uploadImage, getImage, downloadImage, listImages} = require('../controllers/image');

router.post('/', handleUpload, uploadImage);

router.get('/:id', getImage);

router.get('/download/:id', downloadImage);

router.get('/', listImages);

module.exports = router;