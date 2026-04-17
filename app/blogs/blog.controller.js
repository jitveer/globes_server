const Blog = require("./blog.model");
const ApiResponse = require("../../shared/utils/ApiResponse.util");
const asyncHandler = require("../../shared/utils/asyncHandler.util");

console.log("Blog Controller Loaded - Fixed Next Error");

// @desc    Upload image for EditorJS
// @route   POST /api/v1/blogs/upload
// @access  Private (Admin)
exports.uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }

  try {
    // Generate URL for the uploaded file
    const filePath = req.file.path.replace(/\\/g, "/");
    const url = `${req.protocol}://${req.get("host")}/${filePath}`;

    return res.status(200).json({
      success: 1,
      file: {
        url: url,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Fetch URL metadata for EditorJS LinkTool
// @route   GET /api/v1/blogs/fetchUrl
// @access  Private (Admin)
exports.fetchUrl = asyncHandler(async (req, res, next) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: 0, message: "URL is required" });
  }

  // Basic placeholder response to prevent LinkTool from failing
  return res.status(200).json({
    success: 1,
    link: url,
    meta: {
      title: url,
      description: "Preview disabled to ensure server stability",
      image: {
        url: "",
      },
    },
  });
});

// @desc    Create a new blog
// @route   POST /api/v1/blogs
// @access  Private (Admin)
exports.createBlog = asyncHandler(async (req, res, next) => {
  const { title, content, featuredImage, tags, status } = req.body;

  if (!title || !content) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Title and content are required"));
  }

  try {
    const blog = await Blog.create({
      title,
      content,
      featuredImage,
      tags,
      status,
      author: req.user?._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, blog, "Blog created successfully"));
  } catch (error) {
    next(error);
  }
});

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
exports.getAllBlogs = asyncHandler(async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .populate("author", "name email");

    return res
      .status(200)
      .json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
  } catch (error) {
    next(error);
  }
});

// @desc    Get single blog by slug
// @route   GET /api/v1/blogs/:slug
// @access  Public
exports.getBlogBySlug = asyncHandler(async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate("author", "name email");

    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog fetched successfully"));
  } catch (error) {
    next(error);
  }
});

// @desc    Get single blog by ID
// @route   GET /api/v1/blogs/id/:id
// @access  Private (Admin)
exports.getBlogById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate("author", "name email");

    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog fetched successfully"));
  } catch (error) {
    next(error);
  }
});

// @desc    Update a blog
// @route   PUT /api/v1/blogs/:id
// @access  Private (Admin)
exports.updateBlog = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    let blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    }

    blog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog updated successfully"));
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private (Admin)
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    }

    await blog.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Blog deleted successfully"));
  } catch (error) {
    next(error);
  }
});
