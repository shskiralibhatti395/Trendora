import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { ROLES } from "../constants.js";

const products = [
  {
    legacyId: "prod-1",
    name: "Vanguard Minimalist Chrono",
    description: "Precision engineered modern timepiece with elegant titanium bezel.",
    detail: "Ultra-reliable quartz movement with sapphire glass.",
    price: 189,
    category: "Fashion",
    brand: "Vanguard",
    rating: 4.8,
    reviewCount: 3,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    colors: ["Jet Black", "Space Gray"],
    sizes: ["38mm", "42mm"],
    stock: 24,
    featured: true,
    reviews: [{ userName: "Sarah Jenkins", rating: 5, comment: "Gorgeous watch.", createdAt: new Date() }],
  },
  {
    legacyId: "prod-2",
    name: "AeroGlow Tactile Keyboard",
    description: "Hot-swappable mechanical keyboard with RGB matrix.",
    detail: "Custom tactile switches and aircraft aluminum frame.",
    price: 145,
    category: "Tech",
    brand: "AeroKey",
    rating: 4.7,
    stock: 15,
    featured: true,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"],
    colors: ["Chalk White", "Matte Obsidian"],
    sizes: ["75% Layout"],
  },
  {
    legacyId: "prod-3",
    name: "Atelier Wool Trench Coat",
    description: "Premium wool trench coat for cold-season elegance.",
    price: 299,
    category: "Fashion",
    brand: "Atelier",
    rating: 4.9,
    stock: 8,
    featured: true,
    images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"],
    colors: ["Camel Beige", "Classic Black"],
    sizes: ["S", "M", "L"],
  },
  {
    legacyId: "prod-4",
    name: "Quantum Buds ANC Pro",
    description: "Active noise-cancelling earbuds with spatial audio.",
    price: 129,
    category: "Tech",
    brand: "Quantum",
    rating: 4.6,
    stock: 42,
    featured: true,
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"],
    colors: ["Cyber Silver"],
    sizes: ["Standard"],
  },
];

async function seed() {
  await connectDB();

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(products);
    process.stdout.write("Seeded products\n");
  }

  let admin = await User.findOne({ email: "admin@trendora.com" });
  if (!admin) {
    admin = await User.create({
      name: "Trendora Admin",
      email: "admin@trendora.com",
      password: await bcrypt.hash("admin123", 10),
      role: ROLES.ADMIN,
    });
    process.stdout.write("Seeded admin (admin@trendora.com / admin123)\n");
  }

  let user = await User.findOne({ email: "user@trendora.com" });
  if (!user) {
    user = await User.create({
      name: "Mudassar Ali",
      email: "user@trendora.com",
      password: await bcrypt.hash("user123", 10),
      role: ROLES.USER,
      address: {
        fullName: "Mudassar Ali Bhatti",
        street: "142 Premium Fashion Boulevard",
        city: "Singapore",
        state: "Downtown Core",
        zipCode: "189720",
        phone: "+65 9123 4567",
      },
    });
    process.stdout.write("Seeded demo user (user@trendora.com / user123)\n");
  }

  const orderCount = await Order.countDocuments();
  if (orderCount === 0 && user) {
    await Order.create({
      legacyId: "ord-1001",
      userId: user._id,
      customerName: "Mudassar Ali Bhatti",
      items: [
        {
          productId: "prod-1",
          name: "Vanguard Minimalist Chrono",
          price: 189,
          quantity: 1,
          image: products[0].images[0],
        },
      ],
      shippingAddress: user.address,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      totalAmount: 189,
    });
    process.stdout.write("Seeded sample order\n");
  }

  const notifCount = await Notification.countDocuments();
  if (notifCount === 0) {
    await Notification.create({
      title: "Welcome to Trendora!",
      message: "Explore curated fashion and workspace accessories.",
      type: "system",
    });
  }

  await mongoose.disconnect();
  process.stdout.write("Seed complete\n");
}

seed().catch((err) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
