import express from "express";
import {
  getStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  updateUserRole,
  toggleBlockUser,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { validate, createProductRules } from "../middleware/validators.js";
import { body } from "express-validator";

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getStats);
router.get("/products", getAdminProducts);
router.post("/products", createProductRules, validate, createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/bulk-delete", bulkDeleteProducts);
router.get("/orders", getAdminOrders);
router.put(
  "/orders/:id/status",
  body("status").trim().notEmpty(),
  validate,
  updateOrderStatus
);
router.get("/users", getAdminUsers);
router.put(
  "/users/:id/role",
  body("role").isIn(["user", "admin"]),
  validate,
  updateUserRole
);
router.put("/users/:id/block", toggleBlockUser);

export default router;
