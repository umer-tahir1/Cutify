import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(config.upload.dir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter for images
const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed'));
  }
};

// Single image upload
export const uploadSingle = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
}).single('image');

// Multiple images upload (up to 10)
export const uploadMultiple = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
}).array('images', 10);

// Category images (default + hover)
export const uploadCategoryImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 2,
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'hoverImage', maxCount: 1 },
]);
