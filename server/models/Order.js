import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants.js";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    color: String,
    size: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    legacyId: { type: String, unique: true, sparse: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      phone: String,
    },
    paymentMethod: { type: String, default: "COD" },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentId: String,
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

orderSchema.virtual("id").get(function id() {
  return this.legacyId || this._id.toString();
});

orderSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret.legacyId || ret._id.toString();
    ret.userId = ret.userId?.toString?.() || ret.userId;
    ret.totalPrice = ret.totalAmount;
    ret.createdAt = ret.createdAt?.toISOString?.() || ret.createdAt;
    ret.updatedAt = ret.updatedAt?.toISOString?.() || ret.updatedAt;
    delete ret._id;
    delete ret.__v;
    delete ret.legacyId;
    delete ret.totalAmount;
    return ret;
  },
});

export default mongoose.model("Order", orderSchema);
