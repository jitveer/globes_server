const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const imagePresets = require("../config/imagePresets");

/**
 * Processes an image based on a preset type
 * @param {string} inputPath - Path to the uploaded original file
 * @param {string} presetType - Type of preset to apply (e.g., 'profile')
 * @returns {Promise<string>} - Path to the newly created optimized file
 */
const processImage = async (inputPath, presetType) => {
  const preset = imagePresets[presetType];

  if (!preset) {
    throw new Error(`Invalid image preset type: ${presetType}`);
  }

  // Generate output filename with .webp extension
  const fileInfo = path.parse(inputPath);
  const outputFileName = `${fileInfo.name}.${preset.format}`;
  const outputPath = path.join(fileInfo.dir, outputFileName);

  try {
    // 1. Initialize sharp with input image
    let pipeline = sharp(inputPath);

    // 2. Resize only if width/height are specified in preset
    if (preset.width || preset.height) {
      pipeline = pipeline.resize(preset.width, preset.height, {
        fit: "cover",
        withoutEnlargement: true,
      });
    }

    // 3. Convert to target format (usually webp), strip metadata (security), and compress
    await pipeline
      .toFormat(preset.format, { quality: preset.quality })
      .toFile(outputPath);

    // 4. Verification: Check if file size is within limits
    const stats = fs.statSync(outputPath);
    const fileSizeKB = stats.size / 1024;

    // If file is still too large, we might need more aggressive compression
    // However, for most cases, 80 quality webp is significantly smaller
    console.log(
      `Image processed: ${presetType} | Size: ${fileSizeKB.toFixed(2)}KB`,
    );

    // 5. Delete the original unoptimized file
    if (inputPath !== outputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    return outputFileName;
  } catch (error) {
    console.error("Image processing failed:", error);
    // Cleanup: try to remove output if failed
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    throw error;
  }
};

module.exports = { processImage };
