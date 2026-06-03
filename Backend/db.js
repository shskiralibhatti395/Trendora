import fs from "fs";
import path from "path";
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Vanguard Minimalist Chrono",
    description: "Precision engineered modern timepiece with elegant titanium bezel and full grain Italian leather strap.",
    detail: "The Vanguard Minimalist Chrono redefines modern horology. Blending premium components with a sleek Bauhaus-inspired design dial, it features an ultra-reliable quartz movement, surgical-grade brushed titanium case, scratch-resistant sapphire glass, and a soft, full-grain detachable leather strap that matures with rich character. Engineered for both aesthetic composure and daily durability.",
    price: 189,
    category: "Fashion",
    brand: "Vanguard",
    rating: 4.8,
    reviewCount: 3,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Jet Black", "Space Gray", "Desert Gold"],
    sizes: ["38mm", "42mm"],
    stock: 24,
    featured: true,
    reviews: [
      { id: "rev-1", userName: "Sarah Jenkins", rating: 5, comment: "Absolutely gorgeous watch. The titanium feel is incredibly lightweight yet premium.", createdAt: "2026-05-15T12:00:00Z" },
      { id: "rev-2", userName: "Alex Mercer", rating: 4, comment: "Sleek design, goes perfectly with formal and casual outfits. Highly recommend.", createdAt: "2026-05-18T14:30:00Z" },
      { id: "rev-3", userName: "Daniel K.", rating: 5, comment: "Fast shipping, premium packaging, flawless timekeeper.", createdAt: "2026-05-20T08:15:00Z" }
    ]
  },
  {
    id: "prod-2",
    name: "AeroGlow Tactile Keyboard",
    description: "Hot-swappable mechanical masterpiece featuring custom lubricated brown switches and radiant RGB matrix detailing.",
    detail: "An absolute masterpiece for creators, coders, and developers. The AeroGlow Keyboard features customized, factory-lubricated tactile mechanical switches for rapid typing feedback without distracting clatter. Framed in high-density aircraft anodized aluminum, with hot-swappable sockets, dual-mode wireless connectivity, and an ambient RGB backlight array customizable down to each keycap layout.",
    price: 145,
    category: "Tech",
    brand: "AeroKey",
    rating: 4.7,
    reviewCount: 2,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Chalk White", "Matte Obsidian"],
    sizes: ["60% Layout", "75% Layout", "Full Layout"],
    stock: 15,
    featured: true,
    reviews: [
      { id: "rev-4", userName: "Marcus Vance", rating: 5, comment: "Best key tactile response I have ever typed on. Seamlessly integrates with my Mac setup.", createdAt: "2026-05-10T10:45:00Z" },
      { id: "rev-5", userName: "Emily Watson", rating: 4, comment: "Spectacular lighting configurations, keys are incredibly satisfying to type on.", createdAt: "2026-05-14T19:20:00Z" }
    ]
  },
  {
    id: "prod-3",
    name: "Atelier Wool Trench Coat",
    description: "Double-breasted long wool trench coat woven with premium recycled cashmere fibers for cold-season elegance.",
    detail: "Exude effortless architectural structure. Crafted from premium, water-repellent double-face wool blended with soft, recycled cashmere fibers, the Atelier Trench Coat is tailored with structural shoulders, matching fabric belt, storm flap details, and lined with sustainable silk-touch satin. Perfect for high-density elegance throughout the changing seasons.",
    price: 299,
    category: "Fashion",
    brand: "Atelier",
    rating: 4.9,
    reviewCount: 2,
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Camel Beige", "Charcoal Coat", "Classic Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 8,
    featured: true,
    reviews: [
      { id: "rev-6", userName: "Charlotte Ross", rating: 5, comment: "Stunning structure! It feels ultra-warm yet incredibly breathable. The design is timeless.", createdAt: "2026-05-11T15:10:00Z" },
      { id: "rev-7", userName: "Julian V.", rating: 5, comment: "Perfect tailoring, immaculate stitching. Absolute wardrobe essential.", createdAt: "2026-05-16T11:40:00Z" }
    ]
  },
  {
    id: "prod-4",
    name: "Quantum Buds ANC Pro",
    description: "Audiophile active noise-cancelling ear buds with ultra-dense custom sub-bass drivers and spatial audio tuning.",
    detail: "Unrivaled noise isolation. Featuring composite dual diaphragms paired with an active hybrid noise cancelation engine, the Quantum Buds ANC Pro isolates up to 45dB of exterior acoustic frequency. Tunes high-fidelity spatial sound stages automatically using custom ear canal sensors. Features solid 10-hour playback duration, rapid charging, and IPX7 moisture protection.",
    price: 129,
    category: "Tech",
    brand: "Quantum",
    rating: 4.6,
    reviewCount: 2,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Cyber Silver", "Midnight Navy"],
    sizes: ["Standard"],
    stock: 42,
    featured: true,
    reviews: [
      { id: "rev-8", userName: "Leon S.", rating: 5, comment: "Unreal level of active noise cancellation. Blocked highway and office hum instantly.", createdAt: "2026-05-02T13:00:00Z" },
      { id: "rev-9", userName: "Clara Hayes", rating: 4, comment: "Super clear sound. The wireless charge case is so small and rugged.", createdAt: "2026-05-08T16:15:00Z" }
    ]
  },
  {
    id: "prod-5",
    name: "Urban Arc Leather Weekender",
    description: "An elegant, heavy-duty split duffle bag built from supple water-treated calfskin with brass steel custom hardware.",
    detail: "Your companion for aesthetic transits. Built meticulously using water-treated full-grain calf leather, the Urban Arc Weekender bag is constructed with modular internal storage dividers, custom cast brass zipper mechanics, safety padded base plates, and a matching shoulder harness. Fits carry-on flight allocations overhead flawlessly.",
    price: 220,
    category: "Fashion",
    brand: "Urban Arc",
    rating: 4.5,
    reviewCount: 2,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Saddle Tan", "Mahogany Brown", "Absolute Black"],
    sizes: ["40L capacity"],
    stock: 12,
    featured: false,
    reviews: [
      { id: "rev-10", userName: "Brandon F.", rating: 4, comment: "Very robust construction. Fits all my clothes and accessories cleanly for 3-day business trips.", createdAt: "2026-05-01T09:25:00Z" },
      { id: "rev-11", userName: "Isabella M.", rating: 5, comment: "Gorgeous leather aroma and fantastic leather texture. Hand-crafted finish is elegant.", createdAt: "2026-05-09T18:50:00Z" }
    ]
  },
  {
    id: "prod-6",
    name: "ZenDesk Bamboo Monitor Stand",
    description: "Elevated ergonomic real bamboo workspace mount with built-in micro cable channels and quick phone charging tray.",
    detail: "An ergonomic statement for deep-work focus. Hand-machined from organic structural mountain bamboo, the ZenDesk stand positions monitor viewpoints at the ideal alignment to promote spinal ease. Includes custom hollow cord slots, quick micro charging cutouts, anti-slide elastomer foundation grips, and space below to slide midscale mechanical keyboards clean out of sight.",
    price: 64,
    category: "Tech",
    brand: "ZenDesk",
    rating: 4.7,
    reviewCount: 1,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Oak Sand", "Ebony Gold"],
    sizes: ["Standard"],
    stock: 19,
    featured: false,
    reviews: [
      { id: "rev-12", userName: "Sven Lindqvist", rating: 5, comment: "Simplifies utility. Beautiful clean finish, highly recommended for organizing standing desk surfaces.", createdAt: "2026-05-13T12:00:00Z" }
    ]
  },
  {
    id: "prod-7",
    name: "Horizon Polarized Sunglasses",
    description: "Premium acetate sunglasses with full HD polarization, matching silver hardware accents, and impact protection.",
    detail: "Protect your focus in classic Italian styling. Horizon features custom hand-polished organic acetate frames and high-definition fully polarized UV400 protective lenses. Resistant to extreme heat and structural stress, they are joined together with custom internal steel triple hinges to preserve clean fits through intense sunshine environments.",
    price: 95,
    category: "Fashion",
    brand: "Horizon",
    rating: 4.4,
    reviewCount: 1,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Tortoiseshell Amber", "Glossy Piano Black", "Alpine Clear"],
    sizes: ["Refined Medium", "Refined Large"],
    stock: 22,
    featured: false,
    reviews: [
      { id: "rev-13", userName: "Elena Petrova", rating: 4, comment: "Lenses are clear and drastically reduce glare near beaches. Fits comfortably without pinching ears.", createdAt: "2026-05-19T22:15:00Z" }
    ]
  },
  {
    id: "prod-8",
    name: "AeroGlow Pro Gaming Mouse",
    description: "Featherlight 58g ergonomic pixel-accurate workspace mouse with lag-free wireless pairing and optical click switches.",
    detail: "An extension of sensory command. Weighted at a near-frictionless 58 grams, the AeroGlow Pro Mouse utilizes a custom leading sensor tracking up to 26,000 Dots-Per-Inch. Equipped with instantaneous optical mouse click switches that eliminate physical degradation, and a long battery running up to 90 continuous hours with zero latency.",
    price: 110,
    category: "Tech",
    brand: "AeroKey",
    rating: 4.8,
    reviewCount: 1,
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=600&auto=format&fit=crop&q=80"
    ],
    colors: ["Onyx", "Glacier White", "Neon Cyber"],
    sizes: ["Symmetrical Medium", "Ergonomic Right-Handed"],
    stock: 31,
    featured: false,
    reviews: [
      { id: "rev-14", userName: "GamerX", rating: 5, comment: "Feels virtually weightless. Extremely responsive clicks, battery practically lasts forever between charges.", createdAt: "2026-05-21T02:40:00Z" }
    ]
  }
];
const INITIAL_USERS = [
  {
    id: "user-admin",
    email: "admin@trendora.com",
    // Hash of 'admin123' signed with bcrypt - we will support simple match or bcrypt
    passwordHash: "$2a$10$tZ2cQ9HjK0vI3Koxl7Tf9Ou.mO0S.T.qG88fP/O4eFp5tlyuO90yW",
    name: "Trendora Admin",
    role: "admin",
    createdAt: "2026-05-01T00:00:00Z"
  },
  {
    id: "user-client",
    email: "user@trendora.com",
    // Hash of 'user123'
    passwordHash: "$2a$10$hD4o2jT9fW9.oU63U86XUuPh2uGsh6bEreUuXzS5B9xREd/N6tLya",
    name: "Mudassar Ali",
    role: "user",
    address: {
      fullName: "Mudassar Ali Bhatti",
      street: "142 Premium Fashion Boulevard, Tech District",
      city: "Singapore",
      state: "Downtown Core",
      zipCode: "189720",
      phone: "+65 9123 4567"
    },
    createdAt: "2026-05-02T10:00:00Z"
  }
];
const INITIAL_ORDERS = [
  {
    id: "ord-1001",
    userId: "user-client",
    customerName: "Mudassar Ali Bhatti",
    items: [
      {
        productId: "prod-1",
        name: "Vanguard Minimalist Chrono",
        price: 189,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        color: "Space Gray",
        size: "42mm"
      },
      {
        productId: "prod-6",
        name: "ZenDesk Bamboo Monitor Stand",
        price: 64,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
        color: "Ebony Gold",
        size: "Standard"
      }
    ],
    shippingAddress: {
      fullName: "Mudassar Ali Bhatti",
      street: "142 Premium Fashion Boulevard, Tech District",
      city: "Singapore",
      state: "Downtown Core",
      zipCode: "189720",
      phone: "+65 9123 4567"
    },
    paymentMethod: "Razorpay",
    paymentStatus: "Paid",
    paymentId: "pay_sim_10a82f3c",
    orderStatus: "Delivered",
    totalPrice: 253,
    createdAt: "2026-05-18T10:00:00Z",
    updatedAt: "2026-05-20T17:00:00Z"
  },
  {
    id: "ord-1002",
    userId: "user-client",
    customerName: "Mudassar Ali Bhatti",
    items: [
      {
        productId: "prod-4",
        name: "Quantum Buds ANC Pro",
        price: 129,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
        color: "Midnight Navy",
        size: "Standard"
      }
    ],
    shippingAddress: {
      fullName: "Mudassar Ali Bhatti",
      street: "142 Premium Fashion Boulevard, Tech District",
      city: "Singapore",
      state: "Downtown Core",
      zipCode: "189720",
      phone: "+65 9123 4567"
    },
    paymentMethod: "Razorpay",
    paymentStatus: "Paid",
    paymentId: "pay_sim_89d3c2b1",
    orderStatus: "Shipped",
    totalPrice: 129,
    createdAt: "2026-05-21T15:30:00Z",
    updatedAt: "2026-05-22T09:00:00Z"
  }
];
const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Welcome to Trendora!",
    message: "Explore our hand-curated collections of minimalist fashion and developer workspace accessories.",
    type: "system",
    isRead: false,
    createdAt: "2026-05-22T17:15:00Z"
  },
  {
    id: "notif-2",
    userId: "user-client",
    title: "Order Shipped!",
    message: "Your order #ord-1002 containing Quantum Buds ANC Pro has been shipped and is in transit.",
    type: "order",
    isRead: false,
    createdAt: "2026-05-22T09:00:00Z"
  },
  {
    id: "notif-3",
    title: "New Review Posted",
    message: "Sarah Jenkins rated Vanguard Minimalist Chrono 5 stars.",
    type: "rating",
    isRead: true,
    createdAt: "2026-05-15T12:00:00Z"
  }
];
class JSONDatabase {
  products = [];
  users = [];
  orders = [];
  notifications = [];
  constructor() {
    this.init();
  }
  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const data = JSON.parse(fileContent);
        this.products = data.products || INITIAL_PRODUCTS;
        this.users = data.users || INITIAL_USERS;
        this.orders = data.orders || INITIAL_ORDERS;
        this.notifications = data.notifications || INITIAL_NOTIFICATIONS;
      } else {
        this.products = INITIAL_PRODUCTS;
        this.users = INITIAL_USERS;
        this.orders = INITIAL_ORDERS;
        this.notifications = INITIAL_NOTIFICATIONS;
        this.save();
      }
    } catch (error) {
      console.error("Failed to initialize local JSON database, falling back to memory state", error);
      this.products = INITIAL_PRODUCTS;
      this.users = INITIAL_USERS;
      this.orders = INITIAL_ORDERS;
      this.notifications = INITIAL_NOTIFICATIONS;
    }
  }
  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify({
          products: this.products,
          users: this.users,
          orders: this.orders,
          notifications: this.notifications
        }, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Failed to serialize Database state to local storage file", error);
    }
  }
  // --- CRUD API Interfaces ---
  getProducts() {
    return this.products;
  }
  getProductById(id) {
    return this.products.find((p) => p.id === id);
  }
  createProduct(product) {
    this.products.unshift(product);
    this.save();
    return product;
  }
  updateProduct(id, updated) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updated };
      this.save();
      return this.products[idx];
    }
    return null;
  }
  deleteProduct(id) {
    const originalLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    this.save();
    return this.products.length < originalLen;
  }
  bulkDeleteProducts(ids) {
    this.products = this.products.filter((p) => !ids.includes(p.id));
    this.save();
  }
  getUsers() {
    return this.users;
  }
  getUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  getUserById(id) {
    return this.users.find((u) => u.id === id);
  }
  createUser(user) {
    this.users.push(user);
    this.save();
    return user;
  }
  updateUser(id, updated) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updated };
      this.save();
      return this.users[idx];
    }
    return null;
  }
  getOrders() {
    return this.orders;
  }
  getOrderById(id) {
    return this.orders.find((o) => o.id === id);
  }
  getOrdersByUserId(userId) {
    return this.orders.filter((o) => o.userId === userId);
  }
  createOrder(order) {
    this.orders.unshift(order);
    this.save();
    return order;
  }
  updateOrderStatus(id, status) {
    const idx = this.orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this.orders[idx].orderStatus = status;
      this.orders[idx].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.save();
      return this.orders[idx];
    }
    return null;
  }
  getNotifications() {
    return this.notifications;
  }
  createNotification(data) {
    const notif = {
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      ...data,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.notifications.unshift(notif);
    this.save();
    return notif;
  }
  markAllNotificationsRead(userId) {
    this.notifications = this.notifications.map((n) => {
      if (!userId || n.userId === userId || !n.userId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    this.save();
  }
}
export const db = new JSONDatabase();
