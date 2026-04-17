const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
    },
  },
  {
    timestamps: true,
  },
);

// Prevent same user from liking the same property multiple times
wishlistSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
