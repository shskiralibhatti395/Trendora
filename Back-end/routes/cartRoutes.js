import express from "express";
import { getCart, updateCart } from "../controllers/cartController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getCart);
router.put("/", updateCart);

export default router;
