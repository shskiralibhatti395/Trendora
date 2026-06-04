import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import { PAYMENT_STATUS, ORDER_STATUS } from "../constants.js";
import { sendEmail } from "../utils/email.js";

const checkoutOtps = new Map();

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders.map((o) => o.toJSON()));
  } catch (error) {
    next(error);
  }
};

export const requestCheckoutOtp = async (req, res, next) => {
  try {
    const { items, totalPrice } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    checkoutOtps.set(req.user._id.toString(), {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    });

    await sendEmail({
      to: req.user.email,
      subject: `Verify your Trendora order - Rs. ${(totalPrice || 0).toLocaleString()}`,
      html: `<p>Your checkout verification code is: <strong>${otp}</strong></p>`,
    });

    res.json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentId, totalPrice } = req.body;

    if (!items?.length || !shippingAddress) {
      return res.status(400).json({ message: "Cart and shipping address are required" });
    }

    for (const item of items) {
      const product =
        (await Product.findOne({ legacyId: item.productId })) ||
        (await Product.findById(item.productId).catch(() => null));
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    for (const item of items) {
      const product =
        (await Product.findOne({ legacyId: item.productId })) ||
        (await Product.findById(item.productId).catch(() => null));
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      legacyId: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: req.user._id,
      customerName: shippingAddress.fullName,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "COD" ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PAID,
      paymentId: paymentId || `pay_${Date.now()}`,
      orderStatus: ORDER_STATUS.PENDING,
      totalAmount: totalPrice,
    });

    req.user.cart = [];
    await req.user.save();
    checkoutOtps.delete(req.user._id.toString());

    await Notification.create({
      userId: req.user._id,
      title: "Order placed",
      message: `Order #${order.legacyId} for $${totalPrice} was placed successfully.`,
      type: "order",
    });

    res.status(201).json(order.toJSON());
  } catch (error) {
    next(error);
  }
};
