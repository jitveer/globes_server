/**
 * Image Presets Configuration
 * Centralized settings for different image modules
 */
const imagePresets = {
  profile: {
    format: "webp",
    quality: 80, // High quality but optimized
    width: null, // null means keep original width
    height: null, // null means keep original height
    maxFileSizeKB: 150,
    folder: "uploads/profile_img",
  },
  // Future presets can be added here
  /*
  property: {
    format: "webp",
    quality: 85,
    width: 1200,
    height: 800,
    maxFileSizeKB: 500,
    folder: "uploads/properties",
  },
  */
};

module.exports = imagePresets;
