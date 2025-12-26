import Blog from "../models/blogSchema.js";
import User from "../models/userSchema.js";

/* ================= ADD BLOG ================= */
export const addController = async (req, res) => {
  const { title, content, categories, image } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    const blog = new Blog({
      title,
      content,
      image: image || null,
      categories: categories || [],
      authorId: req.user.userId,
      likes: [],
      comments: [],
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error("Error adding blog:", err);
    res.status(500).json(err);
  }
};

/* ================= GET ALL BLOGS ================= */
export const getController = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("authorId", "name email");
    res.json(blogs);
  } catch (err) {
    res.status(500).json(err);
  }
};

/* ================= GET BLOG BY ID ================= */
export const getBlogByIdController = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("authorId", "name email")
      .populate("comments.userId", "name");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json(err);
  }
};

/* ================= LIKE / UNLIKE BLOG ================= */
export const likeController = async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.userId;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const liked = blog.likes.includes(userId);

    if (liked) {
      blog.likes = blog.likes.filter(id => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      message: liked ? "Post unliked" : "Post liked",
      totalLikes: blog.likes.length,
      isLiked: !liked,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

/* ================= ADD COMMENT ================= */
export const commentController = async (req, res) => {
  const blogId = req.params.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.comments.push({
      userId: req.user.userId,
      message,
      createdAt: new Date(),
    });

    await blog.save();

    const updatedBlog = await Blog.findById(blogId)
      .populate("comments.userId", "name");

    const newComment =
      updatedBlog.comments[updatedBlog.comments.length - 1];

    res.status(201).json({
      message: "Comment added",
      comment: newComment,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

/* ================= SAVE / UNSAVE BLOG ================= */
export const saveBlogController = async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.userId;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const user = await User.findById(userId);
    const saved = user.savedBlogs.includes(blogId);

    if (saved) {
      user.savedBlogs = user.savedBlogs.filter(
        id => id.toString() !== blogId
      );
    } else {
      user.savedBlogs.push(blogId);
    }

    await user.save();

    res.json({
      message: saved ? "Blog removed from saved" : "Blog saved",
      isSaved: !saved,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

/* ================= GET SAVED BLOGS ================= */
export const getSavedBlogsController = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "savedBlogs",
      populate: { path: "authorId", select: "name email" },
    });

    res.json(user.savedBlogs);
  } catch (err) {
    res.status(500).json(err);
  }
};

/* ================= UPDATE BLOG ================= */
export const updateBlogController = async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.userId;
  const { title, content, categories, image } = req.body;

  console.log("Update blog request:", { blogId, userId, title, content, categories, image });

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      console.log("Blog not found:", blogId);
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the user is the author
    if (blog.authorId.toString() !== userId.toString()) {
      console.log("Unauthorized update attempt:", { blogAuthor: blog.authorId, requestUser: userId });
      return res.status(403).json({ message: "You are not authorized to update this blog" });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    if (categories) {
      blog.categories = categories;
    }
    if (image !== undefined) {
      blog.image = image;
    }

    await blog.save();

    console.log("Blog updated successfully:", blogId);
    res.json({ message: "Blog updated successfully", blog });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ================= EDIT COMMENT ================= */
export const editCommentController = async (req, res) => {
  const { blogId, commentId } = req.params;
  const userId = req.user.userId;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment author
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this comment" });
    }

    comment.message = message;
    await blog.save();

    const updatedBlog = await Blog.findById(blogId).populate("comments.userId", "name");
    const updatedComment = updatedBlog.comments.id(commentId);

    res.json({ message: "Comment updated", comment: updatedComment });
  } catch (err) {
    res.status(500).json(err);
  }
};

/* ================= DELETE COMMENT ================= */
export const deleteCommentController = async (req, res) => {
  const { blogId, commentId } = req.params;
  const userId = req.user.userId;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment author
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }

    blog.comments.pull(commentId);
    await blog.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

/* ================= DELETE BLOG ================= */
export const deleteBlogController = async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.userId;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the user is the author
    if (blog.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(blogId);

    // Also remove this blog from all users' savedBlogs
    await User.updateMany(
      { savedBlogs: blogId },
      { $pull: { savedBlogs: blogId } }
    );

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};
