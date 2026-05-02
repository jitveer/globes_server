/**
 * Upload Middleware (Multer - Memory Storage)
 *
 * NOTE: Ab hum diskStorage ki jagah memoryStorage use kar rahe hain.
 * File directly disk pe NAHI jayegi — buffer milega controller ko.
 * Controller phir imageOptimizer.js microservice ko call karega jo
 * 3 versions (original PNG, optimized WebP, thumbnail WebP) banayega
 * aur sahi folder mein save karega.
 *
 * Is approach ke fayde:
 *  - Sharp processing ke liye buffer zarori hai
 *  - File save ka poora control controller ke paas hai
 *  - Clean microservices pattern
 *
 * Allowed file types:
 *  - Images: JPEG, JPG, PNG, GIF, WEBP
 *  - Documents: PDF
 */

const multer = require("multer");

// Memory storage: file disk pe nahi, memory (buffer) mein aayegi
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|pdf)$/i;
  const allowedMimetypes =
    /^(image\/(jpeg|jpg|png|gif|webp|x-png|pjpeg)|application\/pdf)$/i;

  const hasAllowedExtension = allowedExtensions.test(
    file.originalname.toLowerCase(),
  );
  const hasAllowedMimetype = allowedMimetypes.test(file.mimetype);

  if (hasAllowedExtension && hasAllowedMimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File upload failed. Invalid file type: ${file.originalname} (${file.mimetype}). Only images (JPEG, JPG, PNG, GIF, WEBP) and PDF documents are allowed.`,
      ),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024, // default 20MB (PDFs can be larger)
  },
});

module.exports = upload;
