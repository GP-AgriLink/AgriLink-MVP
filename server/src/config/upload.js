import multer from 'multer';

// --- Multer Configuration for base64 conversion ---
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// --- Middleware to convert uploaded file to base64 ---
export const convertToBase64 = (req, res, next) => {
  if (!req.file) {
    return next(new Error('No file uploaded.'));
  }

  try {
    // Convert buffer to base64 data URL
    const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    req.file.base64 = base64String;
    next();
  } catch (error) {
    console.error('Error converting to base64:', error);
    next(error);
  }
};
