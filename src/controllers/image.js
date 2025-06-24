const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const s3 = require('../config/s3');
const internalErr = require('../middlewares/error');
const {addImage} = require('../services/image');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', 'uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/x-icon', 'image/svg+xml'];

function fileFilter(req, file, cb) {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Unsupported file type'), false);
    }
}

const temp = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
    fileFilter
}).single('image');


function handleUpload(req, res, next) {
    temp(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'File too large, Max allowed size is 1 MB' });
            }

            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
            }

            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'File upload error' });
        } else if (err) {
            return internalErr(err, req, res);
        }
        next();
    });
}

async function uploadImage(req, res) {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileStream = fs.createReadStream(file.path);
    const fileKey = file.filename;

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
        Body: fileStream,
        ContentType: file.mimetype,
    };

    try {
        await s3.upload(params).promise();

        try {
            const imageInfo = await addImage({
                name: fileKey,
                mimeType: file.mimetype,
                userId: req.userData.userId
            });

            fs.unlink(file.path, () => {});

            return res.status(200).json({
                message: 'Image Uploaded Successfully',
                imageId: imageInfo.id,
                name: imageInfo.name
            });

        } catch (dbErr) {
        
            await s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: fileKey }).promise();
            fs.unlink(file.path, () => {});
            throw dbErr;
        }

    } catch (err) {

        fs.unlink(file.path, () => {});
        return internalErr(err, req, res);

    }
}

async function getImage(req, res){


}

module.exports = {
    handleUpload, 
    uploadImage,
    getImage
};