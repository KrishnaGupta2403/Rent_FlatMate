const { uploadImage } = require('./cloudinary');
const fs = require('fs');

exports.uploadFile = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const url = await uploadImage(file.path, file.filename);
    return res.status(200).json({
      message: 'File uploaded successfully',
      url
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(500).json({ error: 'Server error during file upload' });
  }
};
