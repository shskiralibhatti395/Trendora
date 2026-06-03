import express from "express";
import {
  getProducts,
  getProductById,
  addReview,
} from "../controllers/productController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate, productReviewRules, paginationRules } from "../middleware/validators.js";

const router = express.Router();

router.get("/", paginationRules, validate, getProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", authenticate, productReviewRules, validate, addReview);

export default router;
