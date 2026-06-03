import express from "express";
import { getNotifications, markAllRead } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getNotifications);
router.post("/read-all", authenticate, markAllRead);

export default router;
