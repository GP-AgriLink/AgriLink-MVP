import dotenv from 'dotenv';
dotenv.config();

import cloudinary from 'cloudinary';

import CloudinaryStorage from 'multer-storage-cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agrilink',
        allowed_formats: ['jpeg', 'png', 'jpg'],
    },
});

export { cloudinary, storage };