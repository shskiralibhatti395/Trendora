import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "https://trendora-pi.vercel.app";

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in .env");
  }

  await connectDB();

  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  app.get("/", (_req, res) => {
    res.send("Trendora Backend is running successfully!");
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => {
    process.stdout.write(`Trendora API running on http://localhost:${PORT}\n`);
  });
}

start().catch((err) => {
  process.stderr.write(`Failed to start server: ${err.message}\n`);
  process.exit(1);
});
