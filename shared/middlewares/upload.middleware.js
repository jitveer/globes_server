const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subFolder = "general";
    let mainFolder = "properties";

    // Check if it's a blog upload (usually no 'data' body or specifically for blogs)
    if (req.path.includes("blogs")) {
      mainFolder = "blogs";
    }

    if (req.body.data) {
      try {
        const data = JSON.parse(req.body.data);
        if (data.title) {
          // Sanitize title: remove special chars, replace spaces with underscores, lowercase
          subFolder = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        }
      } catch (e) {
        console.error("Multer Destination Error:", e);
      }
    }

    const finalDir = path.join("uploads", mainFolder, subFolder);

    // Create directory if it doesn't exist
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    cb(null, finalDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf|webp)$/i;
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
        `File upload failed. Invalid file type: ${file.originalname} (${file.mimetype}). Only images (JPEG, JPG, PNG, GIF, WEBP) and PDFs are allowed.`,
      ),
    );
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE),
  },
});
module.exports = upload;
