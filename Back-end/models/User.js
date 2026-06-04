import mongoose from "mongoose";
import { ROLES } from "../constants.js";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: { type: String, default: "Default" },
    selectedSize: { type: String, default: "One Size" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [ROLES.USER, ROLES.ADMIN],
      default: ROLES.USER,
    },
    address: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      phone: String,
    },
    cart: { type: [cartItemSchema], default: [] },
    favorites: { type: [String], default: [] },
    resetOtp: { type: String, select: false },
    resetOtpExpires: { type: Date, select: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    address: this.address,
  };
};

export default mongoose.model("User", userSchema);
