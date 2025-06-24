const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {handleUpload, uploadImage, getImage} = require('../controllers/image');

router.post('/', auth, handleUpload, uploadImage);

router.get('/:imageId', auth, getImage);

module.exports = router;