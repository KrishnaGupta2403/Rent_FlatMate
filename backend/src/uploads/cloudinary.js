const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const hasCloudinaryConfig = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

exports.uploadImage = async (filePath, filename) => {
  if (hasCloudinaryConfig) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'rent_flatmate_listings',
        use_filename: true
      });
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return result.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local storage URL:', err.message);
    }
  }

  return `/uploads/${filename}`;
};
