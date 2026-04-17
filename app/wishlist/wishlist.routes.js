const express = require("express");
const router = express.Router();
const wishlistController = require("./wishlist.controller");
const { protect } = require("../../shared/middlewares/auth.middleware");

// All wishlist routes are protected ( this checks user logged in or not )
router.use(protect);



//save property to wishlist or remove from wishlist if already saved
router.post("/toggle/:propertyId", wishlistController.toggleWishlist);

//get wishlist of user Dashboard in saved properties
router.get("/", wishlistController.getWishlist);

//check if property is in wishlist or not
router.get("/check/:propertyId", wishlistController.checkWishlist);


module.exports = router;