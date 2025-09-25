
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the storage destination for uploaded files
const uploadDir = path.join(__dirname, '../../../../../../uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only video files
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['video/mp4', 'video/x-matroska', 'video/webm', 'video/quicktime'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    // 500MB limit
    fileSize: 500 * 1024 * 1024,
  },
});
