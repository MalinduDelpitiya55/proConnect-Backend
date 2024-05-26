import express from 'express';
const router = express.Router();
import cloudinary from '../utils/cloudinary.js';
import upload from '../middleware/multer.js';

router.post('/upload', upload.single('image'), function (req, res) {
    cloudinary.uploader(req.file.path, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Error uploading"
            })
        }

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: result,
            url: result.secure_url,
            public_id: result.public_id
        })
    })

});

export default router;