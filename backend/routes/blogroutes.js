import express from "express";
import authMiddleware from "../middleware/authmiddleware.js";
import upload from "../config/multerConfig.js";
import {
  addController,
  getController,
  getBlogByIdController,
  likeController,
  commentController,
  saveBlogController,
  getSavedBlogsController,
  updateBlogController,
  deleteBlogController,
  editCommentController,
  deleteCommentController
} from "../controllers/Blogcontroller.js";

const router = express.Router();

// Specific routes MUST come before parameterized routes
router.get("/getblog", getController);
router.get("/saved/all", authMiddleware, getSavedBlogsController);
router.post("/addblog", authMiddleware, addController);

// Parameterized routes
router.get("/:id", getBlogByIdController);
router.put("/:id", authMiddleware, updateBlogController);
router.delete("/:id", authMiddleware, deleteBlogController);
router.patch("/:id/like", authMiddleware, likeController);
router.patch("/:id/save", authMiddleware, saveBlogController);
router.patch("/:id/comment", authMiddleware, commentController);
router.put("/:blogId/comment/:commentId", authMiddleware, editCommentController);
router.delete("/:blogId/comment/:commentId", authMiddleware, deleteCommentController);

export default router;