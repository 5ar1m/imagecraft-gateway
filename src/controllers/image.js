const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { StatusCodes } = require('http-status-codes');
const s3 = require('../config/s3');
const internalErr = require('../middlewares/error');
const {addImage} = require('../services/image');
require('dotenv').config();

const storage = multer.memoryStorage();
const temp = multer({ storage }).single('image');

function handleUpload(req, res, next) {
    temp(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
        } else if (err) {
            return internalErr(err, req, res);
        }
        next();
    });
}

async function uploadImage (req, res) {

    const file = req.file;
    if (!file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/x-icon', 'image/svg+xml'].includes(file.mimetype)){
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Unsupported File Type' });
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

        try {
            await addImage({
                name: fileKey,
                mimeType: file.mimetype,
                userId: req.userData.userId
            });
        return res.status(StatusCodes.OK).json({ message: 'Image Uploaded Successfully', name: fileKey });

        } catch (dbErr) {
            await s3.deleteObject({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: fileKey
            }).promise();

            throw dbErr;
        }

    } catch (err) {
        return internalErr(err, req, res);
    }
}

module.exports = {handleUpload, uploadImage};