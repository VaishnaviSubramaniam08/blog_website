import express from "express";
import authMiddleware from "../middleware/authmiddleware.js";
import {
  
  getChatMessages,
  deleteOldMessages,
} from "../controllers/chatController.js";

const router = express.Router();

// Get messages for a specific room
router.get("/messages/:room", authMiddleware, getChatMessages);

// Delete old messages (admin only - add admin middleware if needed)
router.delete("/cleanup", authMiddleware, deleteOldMessages);

export default router;
