const propertyService = require("./properties.service");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");
const {
  optimizeAndSaveImages,
} = require("../../microservices/imageOptimizer");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Uploaded image files ko process karo via imageOptimizer microservice
// Har image ke liye 3 versions banega:
//   /{destDir}/img-xxx.png           → Original
//   /{destDir}/img-xxx.webp          → Optimized WebP (≤ 200 KB)
//   /{destDir}/img-xxx_thum.webp     → Thumbnail WebP (< 20 KB, blurred)
//
// DB mein sirf { webp, thumbnail } store hoga kyunki:
//   - webp = main display image
//   - thumbnail = progressive loading placeholder
//   - original = backup ke liye disk pe rehega
// ─────────────────────────────────────────────────────────────────────────────
async function processUploadedImages(files, propertyTitle) {
  if (!files || !files.images || files.images.length === 0) return [];

  // Folder name: property title se sanitize karke
  const subFolder = propertyTitle
    ? propertyTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "general";

  const destDir = path.join("uploads", "properties", subFolder);

  const results = [];

  for (const file of files.images) {
    try {
      const optimized = await optimizeAndSaveImages(
        file.buffer,
        file.originalname,
        destDir,
      );

      // DB mein yeh object store hoga
      results.push({
        webp: optimized.webp,           // Main display image (≤200KB WebP)
        thumbnail: optimized.thumbnail, // Progressive loading thumbnail (<20KB)
        original: optimized.original,  // Original PNG (backup, usually not shown)
      });
    } catch (err) {
      console.error(
        `Image optimization failed for ${file.originalname}:`,
        err.message,
      );
    }
  }

  return results;
}

// @desc    Get all properties
// @route   GET /api/v1/properties
// @access  Public
exports.getAllProperties = asyncHandler(async (req, res) => {
  const properties = await propertyService.getAllProperties(req.query);
  res
    .status(200)
    .json(new ApiResponse(200, properties, "Properties fetched successfully"));
});

// @desc    Get property by ID
// @route   GET /api/v1/properties/:id
// @access  Public
exports.getPropertyById = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, property, "Property fetched successfully"));
});

// @desc    Create new property
// @route   POST /api/v1/properties
// @access  Private (Agent/Admin)
exports.createProperty = asyncHandler(async (req, res) => {
  // req.body already contains merged data from parseData middleware in routes.js
  const propertyData = { ...req.body };

  // Handle uploaded image files → imageOptimizer microservice
  if (req.files && req.files.images && req.files.images.length > 0) {
    const optimizedImages = await processUploadedImages(
      req.files,
      propertyData.title,
    );

    // Merge with existing image URLs/objects (filter out base64 strings if any)
    const existingImages = (propertyData.images || []).filter((img) => {
      if (typeof img === "string") return !img.startsWith("data:");
      return true; // Keep existing objects/URLs
    });
    propertyData.images = [...existingImages, ...optimizedImages];
  }

  // Handle brochure upload (PDF - no optimization needed, save as-is)
  if (req.files && req.files.brochure && req.files.brochure.length > 0) {
    const brochureFile = req.files.brochure[0];
    // Brochure ke liye alag service baad mein add kar sakte ho
    // Abhi ke liye brochure processing skip (PDF optimization alag topic hai)
    console.warn(
      "Brochure upload detected but brochure is not processed via imageOptimizer (PDF support coming soon).",
    );
  }

  // Remove 'data' field if it exists (it's redundant now after parsing)
  delete propertyData.data;

  console.log("Creating property with title:", propertyData.title);

  const property = await propertyService.createProperty({
    ...propertyData,
    owner: req.user.id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, property, "Property created successfully"));
});

// @desc    Bulk create properties
// @route   POST /api/v1/properties/bulk
// @access  Private (Admin)
exports.bulkCreateProperties = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Request body must be an array of properties",
        ),
      );
  }

  const propertiesData = req.body.map((prop) => ({
    ...prop,
    owner: req.user.id,
  }));

  const properties = await propertyService.bulkCreateProperties(propertiesData);
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        properties,
        `${properties.length} Properties created successfully`,
      ),
    );
});

// @desc    Update property
// @route   PATCH /api/v1/properties/:id
// @access  Private (Agent/Admin)
exports.updateProperty = asyncHandler(async (req, res) => {
  const propertyData = { ...req.body };

  // Handle uploaded image files → imageOptimizer microservice
  if (req.files && req.files.images && req.files.images.length > 0) {
    const optimizedImages = await processUploadedImages(
      req.files,
      propertyData.title,
    );

    const existingImages = (propertyData.images || []).filter((img) => {
      if (typeof img === "string") return !img.startsWith("data:");
      return true;
    });
    propertyData.images = [...existingImages, ...optimizedImages];
  }

  const property = await propertyService.updateProperty(
    req.params.id,
    propertyData,
    req.user,
  );
  res
    .status(200)
    .json(new ApiResponse(200, property, "Property updated successfully"));
});

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
// @access  Private (Agent/Admin)
exports.deleteProperty = asyncHandler(async (req, res) => {
  await propertyService.deleteProperty(req.params.id, req.user);
  res
    .status(200)
    .json(new ApiResponse(200, null, "Property deleted successfully"));
});
