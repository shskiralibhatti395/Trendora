import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  validate,
  registerRules,
  loginRules,
  resetPasswordRules,
} from "../middleware/validators.js";
import { body } from "express-validator";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.put(
  "/profile",
  authenticate,
  body("name").optional().trim().escape(),
  validate,
  updateProfile
);
router.post(
  "/forgot-password",
  body("email").isEmail().normalizeEmail(),
  validate,
  forgotPassword
);
router.post("/reset-password", resetPasswordRules, validate, resetPassword);

export default router;
