import express from "express";
import authMiddleware from "../middleware/authmiddleware.js";
import {
  registerController,
  loginController,
  logoutController,
  meController,
  getChatTokenController
} from "../controllers/Usercontroller.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, meController);
router.get("/chat-token", authMiddleware, getChatTokenController);

export default router;