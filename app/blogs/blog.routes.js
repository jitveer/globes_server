const express = require("express");
const router = express.Router();
const blogController = require("./blog.controller");
const {
  protect,
  authorize,
} = require("../../shared/middlewares/auth.middleware");
const upload = require("../../shared/middlewares/upload.middleware");

// Public routes
router.get("/", blogController.getAllBlogs);
router.get("/:slug", blogController.getBlogBySlug);

// Private routes (Admin)
router.get("/id/:id", protect, blogController.getBlogById);
router.get("/fetchUrl", protect, blogController.fetchUrl);
router.post(
  "/upload",
  protect,
  upload.single("image"),
  blogController.uploadImage,
);
router.post("/", protect, blogController.createBlog);
router.put("/:id", protect, blogController.updateBlog);
router.patch("/:id", protect, blogController.updateBlog);
router.delete("/:id", protect, blogController.deleteBlog);

module.exports = router;
