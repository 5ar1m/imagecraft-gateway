const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth = require('../middlewares/auth');
const {uploadImage} = require('../controllers/image');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', auth, upload.single('image'), uploadImage);

module.exports = router;