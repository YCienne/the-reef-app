const express = require('express');
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// Initialize bucket
const bucket = admin.storage().bucket();

// Use memory storage so we can access the buffer
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|mp4|mov|avi|pdf|ppt|pptx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    const mimetype = mimetypes.includes(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Only Images, Videos, PDFs, and PowerPoint files are allowed!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', protect, adminOnly, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Create a unique filename
        const filename = `${req.file.fieldname}-${Date.now()}${path.extname(req.file.originalname)}`;
        const blob = bucket.file(filename);

        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            console.error('Upload error:', err);
            res.status(500).send({ message: 'Unable to upload file.', error: err });
        });

        blobStream.on('finish', async () => {
            // Make the file public
            await blob.makePublic();

            // Construct the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            res.send(publicUrl);
        });

        blobStream.end(req.file.buffer);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send({ message: 'Server error during upload.' });
    }
});

module.exports = router;
