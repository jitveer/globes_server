const Wishlist = require("./wishlist.model");
const asyncHandler = require("../../shared/utils/asyncHandler.util");
const ApiResponse = require("../../shared/utils/ApiResponse.util");

// @desc    Toggle property in wishlist (Like/Unlike)
// @route   POST /api/v1/wishlist/toggle/:propertyId
// @access  Private
exports.toggleWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  // Check if already exists
  const existingItem = await Wishlist.findOne({ userId, propertyId });

  if (existingItem) {
    // Unlike: Remove from wishlist
    await Wishlist.findByIdAndDelete(existingItem._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false },
          "Property removed from wishlist",
        ),
      );
  } else {
    // Like: Add to wishlist
    const newItem = await Wishlist.create({ userId, propertyId });
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { liked: true, item: newItem },
          "Property added to wishlist",
        ),
      );
  }
});

// @desc    Get current user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const wishlistItems = await Wishlist.find({ userId })
    .populate("propertyId") // Populate property details
    .sort("-createdAt");

  res
    .status(200)
    .json(new ApiResponse(200, wishlistItems, "Wishlist fetched successfully"));
});

// @desc    Check if a property is liked by user
// @route   GET /api/v1/wishlist/check/:propertyId
// @access  Private
exports.checkWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  const item = await Wishlist.findOne({ userId, propertyId });

  res
    .status(200)
    .json(new ApiResponse(200, { liked: !!item }, "Wishlist check successful"));
});
