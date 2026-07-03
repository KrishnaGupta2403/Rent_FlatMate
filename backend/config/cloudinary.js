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

/**
 * Uploads a local file to Cloudinary, with local file URL fallback if Cloudinary is not configured.
 * @param {string} filePath - Absolute path to the file on disk
 * @param {string} filename - Filename on disk
 * @returns {Promise<string>} The resulting image URL
 */
exports.uploadImage = async (filePath, filename) => {
  if (hasCloudinaryConfig) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'rent_flatmate_listings',
        use_filename: true
      });
      // Optionally delete local file after cloud upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return result.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local storage URL:', err.message);
    }
  }

  // Fallback: return path relative to static server root
  return `/uploads/${filename}`;
};
