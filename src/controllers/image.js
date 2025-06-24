const { v4: uuidv4 } = require('uuid');
const { StatusCodes } = require('http-status-codes');
const s3 = require('../config/s3');
const internalErr = require('../middlewares/error');
const {addImage} = require('../services/image');
require('dotenv').config();

async function uploadImage (req, res) {

    const file = req.file;
    if (!file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)){
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Unsupported File Format' });
    }

    const fileKey = `${uuidv4()}-${file.originalname}`;

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        await s3.upload(params).promise();

        await addImage({
            name: fileKey, 
            mimeType: file.mimetype, 
            userId: req.userData.userId
        });

        return res.status(StatusCodes.OK).json({ message: 'Image Uploaded Successfully', name: fileKey });

    } catch (err) {
        return internalErr(err, req, res);
    }
}

module.exports = {uploadImage};