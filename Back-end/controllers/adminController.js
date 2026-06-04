import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { ORDER_STATUS } from "../constants.js";

export const getStats = async (_req, res, next) => {
  try {
    const [orders, users, products] = await Promise.all([
      Order.find(),
      User.find(),
      Product.find(),
    ]);

    const paidOrders = orders.filter(
      (o) => o.paymentStatus === "Paid" || o.orderStatus === ORDER_STATUS.DELIVERED
    );
    const totalSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lowStockProducts = products.filter((p) => p.stock <= 10).length;

    const salesByCategory = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find(
          (p) => p.legacyId === item.productId || p._id.toString() === item.productId
        );
        const category = prod?.category || "General";
        salesByCategory[category] =
          (salesByCategory[category] || 0) + item.price * item.quantity;
      });
    });

    const categoryDistributionChart = Object.entries(salesByCategory).map(
      ([name, value]) => ({ name, value })
    );

    const salesTrendsMap = {};
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    dates.forEach((d) => {
      salesTrendsMap[d] = 0;
    });

    orders.forEach((o) => {
      const orderDate = o.createdAt.toISOString().split("T")[0];
      if (orderDate in salesTrendsMap) {
        salesTrendsMap[orderDate] += o.totalAmount;
      }
    });

    const trendsChart = Object.entries(salesTrendsMap).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sales: revenue,
    }));

    res.json({
      totalSales,
      ordersCount: orders.length,
      usersCount: users.length,
      productsCount: products.length,
      lowStockProducts,
      categoryDistributionChart,
      trendsChart,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProducts = async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map((p) => p.toJSON()));
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, brand, description, detail, colors, sizes, stock, images, rating } =
      req.body;

    const product = await Product.create({
      legacyId: `prod-${Math.random().toString(36).substring(2, 9)}`,
      name,
      price: Number(price),
      category,
      brand,
      description: description || `Premium ${category} item`,
      detail: detail || "High craftsmanship guaranteed.",
      colors: colors || ["Default"],
      sizes: sizes || ["One Size"],
      stock: Number(stock) || 0,
      images:
        images?.length > 0
          ? images
          : [
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
            ],
      rating: rating !== undefined ? Number(rating) : 5,
    });

    await Notification.create({
      title: "Product added",
      message: `New product "${name}" added to ${category}.`,
      type: "system",
    });

    res.status(201).json(product.toJSON());
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product =
      (await Product.findOne({ legacyId: req.params.id })) ||
      (await Product.findById(req.params.id).catch(() => null));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, req.body);
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
    await product.save();

    res.json(product.toJSON());
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product =
      (await Product.findOneAndDelete({ legacyId: req.params.id })) ||
      (await Product.findByIdAndDelete(req.params.id).catch(() => null));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) {
      return res.status(400).json({ message: "No product IDs provided" });
    }

    await Product.deleteMany({
      $or: [{ legacyId: { $in: ids } }, { _id: { $in: ids.filter((id) => /^[a-f\d]{24}$/i.test(id)) } }],
    });

    res.json({ success: true, count: ids.length });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map((o) => o.toJSON()));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order =
      (await Order.findOne({ legacyId: req.params.id })) ||
      (await Order.findById(req.params.id).catch(() => null));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    await Notification.create({
      userId: order.userId,
      title: "Order status updated",
      message: `Order #${order.legacyId} is now "${status}".`,
      type: "order",
    });

    res.json(order.toJSON());
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt,
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ id: user._id.toString(), name: user.name, role: user.role });
  } catch (error) {
    next(error);
  }
};

export const toggleBlockUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      id: user._id.toString(),
      isBlocked: user.isBlocked,
      message: user.isBlocked ? "User blocked" : "User unblocked",
    });
  } catch (error) {
    next(error);
  }
};
