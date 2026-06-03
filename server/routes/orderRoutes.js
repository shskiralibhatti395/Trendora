import express from "express";
import {
  getMyOrders,
  requestCheckoutOtp,
  createOrder,
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate, orderRules } from "../middleware/validators.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMyOrders);
router.post("/request-otp", requestCheckoutOtp);
router.post("/", orderRules, validate, createOrder);

export default router;
