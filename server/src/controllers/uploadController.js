/**
 * @desc    Upload an image to Cloudinary
 * @route   POST /api/uploads
 * @access  Private
 */
const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }

    // multer-storage-cloudinary has already uploaded the file.
    // req.file.path contains the secure URL.
    res.status(201).json({
        message: 'Image uploaded successfully',
        imageUrl: req.file.url 
    });
};

export { uploadImage };