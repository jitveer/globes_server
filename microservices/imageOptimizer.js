/**
 * ============================================================
 *  IMAGE OPTIMIZER MICROSERVICE
 * ============================================================
 *  Ye microservice ek uploaded image buffer leta hai aur
 *  uske 3 versions banata hai:
 *
 *  1. myimage.png        → Original image (bina kisi change ke)
 *  2. myimage.webp       → Optimized WebP (100-200 KB, main display ke liye)
 *  3. myimage_thum.webp  → Thumbnail WebP (< 20 KB, blurred, fast loading ke liye)
 *
 *  Progressive Loading Strategy:
 *  - Pehle blurry thumbnail load hoti hai (instant)
 *  - Jab full webp load ho jata hai, thumbnail replace ho jaata hai
 *
 *  Usage:
 *    const { optimizeAndSaveImages } = require('../../microservices/imageOptimizer');
 *    const result = await optimizeAndSaveImages(file.buffer, file.originalname, destDir);
 *    // result = { original, webp, thumbnail, baseName }
 * ============================================================
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

/**
 * Ek image ke 3 versions banata hai aur save karta hai.
 *
 * @param {Buffer} imageBuffer    - Multer se mila hua image buffer
 * @param {string} originalName   - Original file ka naam (e.g. "house.jpg")
 * @param {string} destDir        - Jis folder mein save karna hai (e.g. "uploads/properties/my-property")
 *
 * @returns {Promise<{
 *   original: string,    - Saved original PNG ka relative path
 *   webp: string,        - Saved optimized WebP ka relative path
 *   thumbnail: string,   - Saved thumbnail WebP ka relative path
 *   baseName: string     - Base name jo use hua (bina extension)
 * }>}
 */
async function optimizeAndSaveImages(imageBuffer, originalName, destDir) {
  // 1. Destination folder ensure karo
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // 2. Unique base name banao (timestamp + random)
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const baseName = `img-${uniqueSuffix}`;

  // File paths define karo
  const originalPath = path.join(destDir, `${baseName}.png`);
  const webpPath = path.join(destDir, `${baseName}.webp`);
  const thumbPath = path.join(destDir, `${baseName}_thum.webp`);

  // ─────────────────────────────────────────────
  // VERSION 1: Original PNG (koi change nahi)
  // ─────────────────────────────────────────────
  await sharp(imageBuffer).png({ compressionLevel: 6 }).toFile(originalPath);

  // ─────────────────────────────────────────────
  // VERSION 2: Optimized WebP (100-200 KB)
  // Target size: <= 200KB
  // Strategy: quality ko adjust karenge size ke hisaab se
  // ─────────────────────────────────────────────
  const webpBuffer = await _createOptimizedWebP(imageBuffer, 200);
  fs.writeFileSync(webpPath, webpBuffer);

  // ─────────────────────────────────────────────
  // VERSION 3: Thumbnail WebP (< 20KB, blurred)
  // Yeh progressive loading ke liye hai
  // ─────────────────────────────────────────────
  const thumbBuffer = await _createThumbnailWebP(imageBuffer, 20);
  fs.writeFileSync(thumbPath, thumbBuffer);

  // Relative paths return karo (forward slashes for URLs)
  const toUrlPath = (p) => "/" + p.replace(/\\/g, "/");

  return {
    original: toUrlPath(originalPath),
    webp: toUrlPath(webpPath),
    thumbnail: toUrlPath(thumbPath),
    baseName,
  };
}

/**
 * Optimized WebP banata hai jo targetSizeKB ke andar ho.
 * Binary search se quality adjust karta hai.
 *
 * @param {Buffer} inputBuffer
 * @param {number} targetSizeKB  - Maximum allowed size in KB (default 200)
 * @returns {Promise<Buffer>}
 */
async function _createOptimizedWebP(inputBuffer, targetSizeKB = 200) {
  const targetBytes = targetSizeKB * 1024;

  // Pehle image metadata lo (width, height)
  const meta = await sharp(inputBuffer).metadata();
  const originalWidth = meta.width || 1920;

  // Max width cap karo (bahut badi image resize ho)
  const maxWidth = Math.min(originalWidth, 1920);

  let quality = 82; // Starting quality
  let minQ = 30;
  let maxQ = 90;
  let bestBuffer = null;

  // Binary search: quality adjust karo taaki size target ke andar rahe
  for (let attempt = 0; attempt < 8; attempt++) {
    const buf = await sharp(inputBuffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    if (buf.length <= targetBytes) {
      bestBuffer = buf;
      minQ = quality + 1; // Try higher quality
    } else {
      maxQ = quality - 1; // Lower quality chahiye
    }

    quality = Math.round((minQ + maxQ) / 2);

    if (minQ > maxQ) break;
  }

  // Agar koi acceptable buffer nahi mila to low quality fallback
  if (!bestBuffer) {
    bestBuffer = await sharp(inputBuffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: minQ > 30 ? minQ : 30 })
      .toBuffer();
  }

  return bestBuffer;
}

/**
 * Thumbnail WebP banata hai:
 * - 20KB se kam size
 * - Thoda blurred (placeholder effect ke liye)
 * - Chhoti dimensions
 *
 * @param {Buffer} inputBuffer
 * @param {number} targetSizeKB  - Maximum allowed size in KB (default 20)
 * @returns {Promise<Buffer>}
 */
async function _createThumbnailWebP(inputBuffer, targetSizeKB = 20) {
  const targetBytes = targetSizeKB * 1024;

  // Thumbnail dimensions: max 400px wide (placeholder ke liye kaafi hai)
  const THUMB_WIDTH = 400;
  // Blur sigma: 2-3 kaafi achha lagta hai (too much blur = ugly)
  const BLUR_SIGMA = 2.5;

  let quality = 40;
  let minQ = 10;
  let maxQ = 65;
  let bestBuffer = null;

  for (let attempt = 0; attempt < 8; attempt++) {
    const buf = await sharp(inputBuffer)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .blur(BLUR_SIGMA)
      .webp({ quality })
      .toBuffer();

    if (buf.length <= targetBytes) {
      bestBuffer = buf;
      minQ = quality + 1;
    } else {
      maxQ = quality - 1;
    }

    quality = Math.round((minQ + maxQ) / 2);

    if (minQ > maxQ) break;
  }

  // Agar target size nahi mili to aur chhoti size try karo
  if (!bestBuffer) {
    bestBuffer = await sharp(inputBuffer)
      .resize({ width: 200, withoutEnlargement: true })
      .blur(BLUR_SIGMA)
      .webp({ quality: 20 })
      .toBuffer();
  }

  return bestBuffer;
}

module.exports = { optimizeAndSaveImages };
