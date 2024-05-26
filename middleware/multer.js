import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Set the limits for file uploads
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 10 * 1024 * 1024 // Set the limit to 10 MB
    }
});

console.log("test");

export default upload;
