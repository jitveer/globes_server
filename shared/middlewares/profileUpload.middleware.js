const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure storage for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/profile_img";
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Get user data from request (req.user is populated by auth middleware)
    const userId = req.user ? req.user.id : "unknown";
    const firstName = req.user ? req.user.firstName : "user";
    const lastName = req.user ? req.user.lastName : "";

    // Sanitize user name: remove special chars and spaces
    const sanitizedName = `${firstName}_${lastName}`
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_");

    // Format: name_userID_timestamp.extension
    const uniqueSuffix = Date.now();
    const fileName = `${sanitizedName}_${userId}_${uniqueSuffix}${path.extname(file.originalname)}`;

    cb(null, fileName);
  },
});

// Filter files to ensure only images are uploaded (Security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /image\/(jpeg|jpg|png|webp)/;
  const isMimetypeValid = allowedTypes.test(file.mimetype);

  if (isMimetypeValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, JPEG, PNG and WEBP images are allowed!",
      ),
      false,
    );
  }
};

const profileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for original file (will be compressed to < 150KB)
  },
});

module.exports = profileUpload;
