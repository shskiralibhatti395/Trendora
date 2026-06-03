import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginRules = [
  body("email").trim().notEmpty().withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const resetPasswordRules = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("Valid 6-digit OTP required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const productReviewRules = [
  param("id").trim().notEmpty(),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
  body("comment").trim().notEmpty().withMessage("Comment is required").escape(),
];

export const createProductRules = [
  body("name").trim().notEmpty().withMessage("Name is required").escape(),
  body("price").isFloat({ min: 0 }).withMessage("Valid price required"),
  body("category").trim().notEmpty().withMessage("Category is required").escape(),
  body("brand").trim().notEmpty().withMessage("Brand is required").escape(),
];

export const orderRules = [
  body("items").isArray({ min: 1 }).withMessage("Order items required"),
  body("shippingAddress").isObject().withMessage("Shipping address required"),
  body("totalPrice").isFloat({ min: 0 }).withMessage("Valid total required"),
];

export const paginationRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];
