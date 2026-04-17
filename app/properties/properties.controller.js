const propertyService = require("./properties.service");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");

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
  let propertyData = req.body;

  // If data is sent as a JSON string in FormData
  if (req.body.data) {
    try {
      propertyData = JSON.parse(req.body.data);
    } catch (e) {
      console.error("Error parsing JSON data from body:", e);
    }
  }

  // Handle uploaded files
  if (req.files) {
    if (req.files.images) {
      const imagePaths = req.files.images.map(
        (file) => `/${file.destination.replace(/\\/g, "/")}/${file.filename}`,
      );
      // Combine with existing image URLs if any
      propertyData.images = [
        ...(propertyData.images || []),
        ...imagePaths,
      ].filter((img) => img && !img.startsWith("data:"));
    }

    if (req.files.brochure && req.files.brochure.length > 0) {
      const brochureFile = req.files.brochure[0];
      propertyData.brochure = `/${brochureFile.destination.replace(/\\/g, "/")}/${brochureFile.filename}`;
    }
  }

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
  let propertyData = req.body;

  if (req.body.data) {
    try {
      propertyData = JSON.parse(req.body.data);
    } catch (e) {
      console.error("Error parsing JSON data from body:", e);
    }
  }

  if (req.files) {
    if (req.files.images) {
      const imagePaths = req.files.images.map(
        (file) => `/${file.destination.replace(/\\/g, "/")}/${file.filename}`,
      );
      propertyData.images = [
        ...(propertyData.images || []),
        ...imagePaths,
      ].filter((img) => img && !img.startsWith("data:"));
    }

    if (req.files.brochure && req.files.brochure.length > 0) {
      const brochureFile = req.files.brochure[0];
      propertyData.brochure = `/${brochureFile.destination.replace(/\\/g, "/")}/${brochureFile.filename}`;
    }
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
