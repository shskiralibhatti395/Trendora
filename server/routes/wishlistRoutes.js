import express from "express";
import { getWishlist, updateWishlist } from "../controllers/cartController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getWishlist);
router.put("/", updateWishlist);

export default router;
