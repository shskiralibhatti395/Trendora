# Trendora - E-Commerce Web Application
## Final Year Project - Viva Notes

---

## 1. Project Overview
**Trendora** is a full-stack e-commerce web application where users can browse products, add them to cart, place orders, and manage their profile. It also has a complete admin panel for managing products, orders, and users.

**Live URLs:**
- Front-end (Store): https://trendora-pi.vercel.app
- Back-end (API): https://trendora-backend-ngio.onrender.com
- Admin Panel: Separate deployment on Vercel

---

## 2. Features (Functionalities)

### User Features
- **Register / Login** — user can create account and sign in
- **Forgot / Reset Password** — password reset via email OTP
- **Product Listing** — browse products with pagination
- **Search & Filters** — search by name, filter by category, brand, price range, color, size, rating
- **Product Detail** — view full product info, images, colors, sizes, reviews
- **Product Reviews** — logged-in users can rate (1-5) and comment on products
- **Add to Cart** — select color, size, quantity, add to cart
- **Wishlist (Favorites)** — save products for later
- **Checkout** — 3-step process: review cart → shipping address → payment
- **Payment Methods** — Card (simulated), PayPal (simulated), Crypto (simulated), Cash on Delivery
- **Order History** — view past orders with status
- **Profile Management** — update name and shipping address
- **Notifications** — bell icon with system/order notifications
- **Dark/Light Mode** — toggle theme, preference saved in browser

### Admin Features
- **Dashboard** — total sales, orders, users, low-stock alerts, sales charts (7-day trend + category distribution)
- **Product Management** — add, edit, delete, bulk delete products
- **Image Upload** — drag-and-drop or URL input
- **Order Management** — view all orders, update status (Pending → Shipped → Delivered → Cancelled)
- **User Management** — view users, promote/demote admin role, block/unblock
- **Admin Login** — separate "Only For Admin" form with manual credentials

---

## 3. Technologies Used

### Backend (Server-side)
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for building REST APIs |
| **MongoDB** (Atlas) | NoSQL database (cloud-hosted on MongoDB Atlas) |
| **Mongoose** | MongoDB ODM (Object Data Modeling - defines schemas) |
| **JWT (jsonwebtoken)** | Authentication tokens (JSON Web Tokens) |
| **bcryptjs** | Password hashing and comparison |
| **Resend** | Email API service (sends OTP for password reset & checkout) |
| **express-rate-limit** | API rate limiting (200 requests per 15 minutes on auth routes) |
| **helmet** | HTTP security headers middleware |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **cors** | Cross-Origin Resource Sharing (allows frontend to call backend) |
| **cookie-parser** | Parse HTTP cookies for token storage |
| **express-validator** | Server-side request validation |
| **dotenv** | Load environment variables from .env file |

### Frontend (Client-side)
| Technology | Purpose |
|---|---|
| **React 19** | UI library for building components |
| **Vite** | Build tool and development server (fast HMR) |
| **Tailwind CSS v4** | Utility-first CSS framework for styling |
| **lucide-react** | Icon library (SVG icons) |
| **recharts** | Charting library for admin dashboard graphs |
| **motion** | Animation library (successor to Framer Motion) |

### Database
- **MongoDB Atlas** — cloud-hosted MongoDB database
- **4 Collections:** `users`, `products`, `orders`, `notifications`

### Deployment
| Platform | Deploys | URL |
|---|---|---|
| **Vercel** | Front-end (Store) | https://trendora-pi.vercel.app |
| **Render** | Back-end (API) | https://trendora-backend-ngio.onrender.com |
| **Vercel** | Admin Panel | Separate Vercel project |

---

## 4. Complete Project Architecture (Detailed)

```
Trendora/
│
├── package.json                     # Root package.json - uses "concurrently" to run
│                                    # both backend and frontend with "npm run dev"
│
├── Back-end/                        # === EXPRESS.JS API SERVER ===
│   │
│   ├── .env                         # Environment variables (MONGODB_URI, JWT_SECRET, etc.)
│   │
│   ├── package.json                 # Backend dependencies and scripts
│   │
│   ├── server.js                    # ENTRY POINT - starts Express server
│   │   - Imports express, cors, helmet, cookie-parser, rate-limit, etc.
│   │   - Configures middleware (CORS, helmet, rate limiting, sanitize)
│   │   - Mounts all route files under /api prefix
│   │   - Connects to MongoDB via connectDB()
│   │   - Error handling middleware at the end
│   │   - Listens on process.env.PORT or 5000
│   │   - Health check route: GET /api/health → { status: "ok" }
│   │
│   ├── constants.js                 # Constants file
│   │   - ROLES: { USER: "user", ADMIN: "admin" }
│   │   - ORDER_STATUS: ["Pending","Processing","Shipped","Delivered","Cancelled"]
│   │   - PAYMENT_STATUS: ["Pending","Paid","Failed"]
│   │   - COOKIE_NAME: "token"
│   │
│   ├── config/
│   │   └── db.js                    # Database connection config
│   │       - Connects to MongoDB Atlas using mongoose.connect()
│   │       - Has retry logic on connection failure
│   │       - Logs connection success/failure
│   │
│   ├── models/                      # Mongoose Schemas (Database structure)
│   │   │
│   │   ├── User.js                  # User Schema
│   │   │   Fields: name, email (unique), password (select: false - hidden by default),
│   │   │          role (user/admin), address (embedded object with fullName, 
│   │   │          street, city, state, zipCode, phone), cart (array of items with 
│   │   │          productId, quantity, selectedColor, selectedSize), 
│   │   │          favorites (array of product IDs), resetOtp (hashed, hidden),
│   │   │          resetOtpExpires (Date, hidden), isBlocked (boolean)
│   │   │   Methods: toSafeJSON() - returns safe user object without password
│   │   │
│   │   ├── Product.js               # Product Schema
│   │   │   Fields: legacyId (unique, sparse), name, description, detail, price,
│   │   │          category (indexed), brand, images (array of URLs), 
│   │   │          colors (array), sizes (array), stock, rating (default 5),
│   │   │          reviewCount (default 0), reviews (embedded array of {userName,
│   │   │          rating, comment, timestamps}), featured (boolean)
│   │   │   Virtuals: id → returns legacyId or _id
│   │   │   toJSON transform: adds id, removes _id/__v/legacyId
│   │   │
│   │   ├── Order.js                 # Order Schema
│   │   │   Fields: legacyId (unique, sparse), userId (ref: User, indexed),
│   │   │          customerName, items (array of {productId, name, price, 
│   │   │          quantity, image, color, size}), shippingAddress (embedded),
│   │   │          paymentMethod, paymentStatus (Pending/Paid/Failed),
│   │   │          paymentId, orderStatus (Pending/Processing/Shipped/
│   │   │          Delivered/Cancelled), totalAmount
│   │   │   Virtuals: id → returns legacyId or _id, 
│   │   │            totalPrice → maps to totalAmount
│   │   │
│   │   └── Notification.js          # Notification Schema
│   │       Fields: userId (nullable - null = system-wide), title, message,
│   │              type (system/order/rating), isRead (boolean, default false)
│   │
│   ├── controllers/                 # Business Logic (request handlers)
│   │   │
│   │   ├── authController.js        # Authentication Controller
│   │   │   Methods:
│   │   │   - register: validates input, hashes password with bcrypt, creates 
│   │   │     user, generates JWT token, sets cookie, returns {token, user}
│   │   │   - login: finds user by email (+password), compares bcrypt hash,
│   │   │     checks isBlocked, generates JWT, returns {token, user}
│   │   │   - logout: clears JWT cookie
│   │   │   - getMe: returns current logged-in user (via auth middleware)
│   │   │   - updateProfile: updates name and address fields
│   │   │   - forgotPassword: generates 6-digit OTP, hashes it with bcrypt,
│   │   │     stores on user with 15-min expiry, sends email via Resend
│   │   │   - resetPassword: verifies OTP + expiry, hashes new password
│   │   │
│   │   ├── productController.js     # Product Controller
│   │   │   Methods:
│   │   │   - getProducts: fetches all products, applies search/filter/
│   │   │     pagination (search by name/description/brand, filter by 
│   │   │     category/brand/price range/rating/color/size)
│   │   │   - getProductById: finds by legacyId or _id, returns product 
│   │   │     with 4 related products from same category
│   │   │   - addReview: authenticated users add rating+comment, recalculates
│   │   │     average rating, creates notification
│   │   │
│   │   ├── cartController.js        # Cart Controller
│   │   │   Methods:
│   │   │   - getCart: fetches user's cart, hydrates with full product data
│   │   │     (joins product details for each cart item)
│   │   │   - updateCart: replaces user's entire cart array
│   │   │   - getWishlist: fetches favorites, hydrates with product data
│   │   │   - updateWishlist: replaces user's favorites array
│   │   │
│   │   ├── orderController.js       # Order Controller
│   │   │   Methods:
│   │   │   - getMyOrders: returns logged-in user's orders (newest first)
│   │   │   - requestCheckoutOtp: generates 6-digit OTP, stores in-memory 
│   │   │     Map with 10-min expiry, sends via Resend email
│   │   │   - createOrder: validates OTP, checks stock for each item,
│   │   │     decrements stock, creates Order document, clears user cart,
│   │   │     sends notification
│   │   │
│   │   ├── adminController.js       # Admin Controller
│   │   │   Methods:
│   │   │   - getStats: returns total sales, order/user/product counts,
│   │   │     low-stock alerts (stock < 10), 7-day revenue data, 
│   │   │     category-wise sales distribution
│   │   │   - CRUD Products: create (with validation), update, delete, bulk delete
│   │   │   - getOrders: list all orders
│   │   │   - updateOrderStatus: change status (validates against enum)
│   │   │   - getUsers: list all users
│   │   │   - updateUserRole: toggle between user/admin
│   │   │   - toggleUserBlock: block/unblock user
│   │   │
│   │   └── notificationController.js # Notification Controller
│   │       - getNotifications: returns latest 50 notifications
│   │       - markAllRead: marks all user's notifications as read
│   │
│   ├── routes/                      # API Route Definitions
│   │   ├── authRoutes.js            # POST /register, /login, /logout, /forgot-password,
│   │   │                           # /reset-password, GET /me, PUT /profile
│   │   ├── productRoutes.js         # GET / (list), GET /:id (detail), POST /:id/reviews
│   │   ├── cartRoutes.js            # GET / (get cart), PUT / (update cart)
│   │   ├── wishlistRoutes.js        # GET / (get wishlist), PUT / (update wishlist)
│   │   ├── orderRoutes.js           # GET / (my orders), POST /request-otp, POST / (create)
│   │   ├── adminRoutes.js           # GET /stats, CRUD products, GET/PUT orders, GET/PUT users
│   │   └── notificationRoutes.js    # GET / (list), POST /read-all
│   │
│   ├── middleware/                  # Express Middleware
│   │   ├── authMiddleware.js        # JWT Authentication Middleware
│   │   │   - Checks cookie first (req.cookies.token)
│   │   │   - Falls back to Bearer token (req.headers.authorization)
│   │   │   - Verifies JWT with jwt.verify()
│   │   │   - Fetches user from DB, checks isBlocked
│   │   │   - Attaches req.user for downstream routes
│   │   │
│   │   ├── adminMiddleware.js       # Admin Authorization Middleware
│   │   │   - Checks req.user.role === "admin"
│   │   │   - Returns 401 if not admin
│   │   │
│   │   ├── errorMiddleware.js       # Error Handling Middleware
│   │   │   - 404 handler for unknown routes
│   │   │   - Global error handler (catches all errors)
│   │   │
│   │   └── validators.js           # Express-validator rules
│   │       - Validation chains for register, login, product create,
│   │         review, order, forgot/reset password, etc.
│   │       - Checks for required fields, email format, password length
│   │
│   ├── utils/                       # Utility Functions
│   │   ├── generateToken.js         # JWT Token Helpers
│   │   │   - generateToken(userId): signs JWT with secret + 7-day expiry
│   │   │   - setCookie(res, token): sets HTTP-only cookie with options
│   │   │     (sameSite, secure based on NODE_ENV)
│   │   │   - clearCookie(res): clears the token cookie
│   │   │
│   │   ├── email.js                 # Email Service
│   │   │   - Uses Resend API to send emails
│   │   │   - sendResetOtp(email, otp): sends password reset OTP
│   │   │   - sendCheckoutOtp(email, otp): sends checkout verification OTP
│   │   │   - Falls back gracefully if RESEND_API_KEY is not configured
│   │   │
│   │   ├── cartHelpers.js           # Cart Utility Functions
│   │   │   - hydrateCartItems(cart, products): joins cart data with 
│   │   │     full product details (name, price, image, stock)
│   │   │   - serializeCartForStorage(cartItems): prepares cart for DB storage
│   │   │   - hydrateFavorites(favIds, products): joins favorite IDs with 
│   │   │     full product data
│   │   │
│   │   └── seed.js                  # Database Seeder
│   │       - Connects to MongoDB
│   │       - Seeds 4 products (Fashion + Tech categories)
│   │       - Creates/updates admin account (admin@trendora.com / Asdf@295)
│   │       - Creates demo user (user@trendora.com / user123) with sample address
│   │       - Creates sample order and welcome notification
│   │       - Runs every deployment (idempotent - checks counts first)
│   │       - Disconnects after completion
│   │
│   └── Back-end Deployment:
│       Platform: Render
│       Root Directory: Back-end/
│       Start Command: npm run seed && node server.js
│       Health Check: GET /api/health
│
├── Front-end/                       # === REACT + VITE CLIENT (STOREFRONT) ===
│   │
│   ├── .env                         # VITE_API_URL=http://localhost:5000 (dev)
│   ├── .env.production              # VITE_API_URL=https://trendora-backend-ngio.onrender.com (prod)
│   │
│   ├── index.html                   # HTML entry point - mounts React app to #root
│   │                               # Includes favicon SVG link
│   │
│   ├── vite.config.js              # Vite Configuration
│   │   - Plugins: React, Tailwind CSS
│   │   - Dev server on port 5173
│   │   - Proxy /api → localhost:5000 (for development)
│   │
│   ├── package.json                # Frontend dependencies
│   │
│   ├── public/
│   │   └── favicon.svg             # Trendora T logo favicon
│   │
│   ├── src/
│   │   │
│   │   ├── main.jsx                # React Entry Point
│   │   │   - ReactDOM.createRoot render
│   │   │   - Wraps App in StoreProvider
│   │   │   - Imports index.css (Tailwind)
│   │   │
│   │   ├── index.css               # Tailwind CSS imports (@tailwind base/components/utilities)
│   │   │
│   │   ├── App.jsx                 # ROOT COMPONENT - Tab-based Router
│   │   │   State: tab, selectedProductId, selectedCategory, searchKeyword, 
│   │   │         promoDiscountPrice, promoCodeApplied
│   │   │   Functions:
│   │   │   - renderActiveTab(): switch-case for all pages
│   │   │   - Toast notification system (floating alerts)
│   │   │   - Loading state (spinner while StoreContext initializes)
│   │   │   Pages: home, products, product-detail, cart, checkout, 
│   │   │          profile, profile-wishlist, profile-orders, auth, admin
│   │   │   Components: Header, Footer
│   │   │
│   │   ├── context/
│   │   │   └── StoreContext.jsx    # GLOBAL STATE (React Context + useReducer)
│   │   │       State: user, cart, wishlist, notifications, toasts, theme,
│   │   │             isLoading, showToast
│   │   │       Actions:
│   │   │       - login(email, pass): calls authService, sets user + token,
│   │   │         syncs cart/wishlist from server
│   │   │       - register(name, email, pass): calls authService, sets user
│   │   │       - logout(): clears user/token, resets cart/wishlist
│   │   │       - addToCart(product, qty, color, size): adds item, saves
│   │   │         to server via cartService
│   │   │       - updateCartItem(productId, qty): updates qty, syncs to server
│   │   │       - removeFromCart(productId): removes item, syncs to server
│   │   │       - toggleWishlist(product): add/remove from favorites, syncs
│   │   │       - fetchNotifications(): polls every 15 seconds
│   │   │       - showToast(msg, type): shows floating alert
│   │   │       - toggleTheme(): switches dark/light, persists to localStorage
│   │   │
│   │   ├── services/               # API Service Layer
│   │   │   ├── api.js              # Base fetch wrapper
│   │   │   │   - API_BASE from VITE_API_URL env var
│   │   │   │   - setToken/clearToken: manages Bearer token in memory
│   │   │   │   - apiFetch(path, options): builds full URL, adds auth header,
│   │   │   │     handles JSON parsing, error handling with status codes
│   │   │   │   - Auto-strips/re-adds /api prefix
│   │   │   │
│   │   │   ├── authService.js      # Auth API calls
│   │   │   │   login, register, logout, getMe, updateProfile, forgotPassword,
│   │   │   │   resetPassword
│   │   │   │
│   │   │   ├── productService.js   # Product API calls
│   │   │   │   getProducts, getProductById, addReview
│   │   │   │
│   │   │   ├── cartService.js      # Cart/Wishlist API calls
│   │   │   │   getCart, saveCart, getWishlist, saveWishlist
│   │   │   │
│   │   │   ├── orderService.js     # Order API calls
│   │   │   │   getOrders, requestOtp, placeOrder
│   │   │   │
│   │   │   └── adminService.js     # Admin API calls
│   │   │       getStats, getProducts, createProduct, updateProduct, 
│   │   │       deleteProduct, bulkDeleteProducts, getOrders, updateOrderStatus,
│   │   │       getUsers, updateUserRole, toggleUserBlock
│   │   │
│   │   ├── components/             # Reusable UI Components
│   │   │   │
│   │   │   ├── Header.jsx         # Main Navigation Header
│   │   │   │   - Sticky top bar
│   │   │   │   - Logo + navigation links (Home, Shop, Cart, etc.)
│   │   │   │   - Search bar (with searchKeyword state)
│   │   │   │   - Cart icon with item count badge
│   │   │   │   - Wishlist icon with item count badge
│   │   │   │   - Notification bell with unread count + dropdown
│   │   │   │   - User profile dropdown (login/logout/profile/admin)
│   │   │   │   - Dark/Light theme toggle button
│   │   │   │   - Responsive mobile menu
│   │   │   │
│   │   │   └── Footer.jsx          # Footer
│   │   │       - Links, newsletter, copyright
│   │   │
│   │   └── pages/                   # Page Components
│   │       │
│   │       ├── HomePage.jsx        # HOME PAGE
│   │       │   Sections:
│   │       │   1. Hero Carousel (3 slides with auto-rotate every 6 seconds,
│   │       │      dot indicators, "Trendora" branding)
│   │       │   2. Feature Cards (3 cards: Complimentary Delivery, Simulated 
│   │       │      Checkout with Razorpay image, Curated Collections)
│   │       │   3. Shop Curated Verticals (3 category cards: Premium Fashion → 
│   │       │      Fashion filter, Workspace Tech → Tech filter, Office Craft → 
│   │       │      Workspace filter - all navigate to ProductsPage with category)
│   │       │   4. Featured Treasures (4 product cards with image, name, price,
│   │       │      rating, wishlist toggle, click to product detail)
│   │       │   5. Brand Strip (logos row)
│   │       │   6. Stats Banner (milestones: products, daily orders, 
│   │       │      satisfaction rate, countries)
│   │       │   7. Full-width Banner CTA
│   │       │   Functions: handleProductClick(id) - sets selectedProductId 
│   │       │             and navigates to product-detail tab
│   │       │
│   │       ├── ProductsPage.jsx    # PRODUCTS LISTING PAGE
│   │       │   Features:
│   │       │   - Search bar (local + global)
│   │       │   - Filter panel: category (All/Fashion/Tech/Workspace), brand,
│   │       │     price range (slider), color, size, rating
│   │       │   - Product grid display (image, name, price, rating, wishlist,
│   │       │     add to cart buttons)
│   │       │   - Load More pagination (8 products per page)
│   │       │   - Reset filters button
│   │       │   - Mobile-responsive filter toggle
│   │       │   - API calls use VITE_API_URL + /api/products
│   │       │   - Accepts selectedCategory prop for pre-filtering
│   │       │
│   │       ├── ProductDetailPage.jsx # PRODUCT DETAIL PAGE
│   │       │   Sections:
│   │       │   - Back button → catalog
│   │       │   - Image gallery (main image + thumbnail carousel)
│   │       │   - Product info: brand, category, name, rating stars, 
│   │       │     review count, stock status
│   │       │   - Price display
│   │       │   - Description
│   │       │   - Color selector (pill buttons, changes main image)
│   │       │   - Size selector (pill buttons)
│   │       │   - Quantity selector (+/- buttons)
│   │       │   - Add to Cart button (or Out of Stock disabled)
│   │       │   - Trust badges (authentic, 30-day return)
│   │       │   - Technical Dossier section
│   │       │   - Reviews section: star rating input + comment textarea +
│   │       │     submit button + existing reviews list
│   │       │   - Related Products (4 items from same category)
│   │       │   States: loading (skeleton), error (API fail), not found,
│   │       │           full product display
│   │       │
│   │       ├── CartPage.jsx        # SHOPPING CART PAGE
│   │       │   Features:
│   │       │   - List of cart items with image, name, color, size
│   │       │   - Quantity controls (+/-) per item
│   │       │   - Remove item button
│   │       │   - Promo code input (TRENDORA15 = 15% off)
│   │       │   - Price summary: subtotal, discount, total
│   │       │   - Proceed to Checkout button
│   │       │   - Empty cart state with "Start Shopping" CTA
│   │       │
│   │       ├── CheckoutPage.jsx    # CHECKOUT PAGE (3-step)
│   │       │   Step 1: Review Cart (items summary)
│   │       │   Step 2: Shipping Address (fullName, street, city, state, 
│   │       │           zipCode, phone - form with validation)
│   │       │   Step 3: Payment Method Selection
│   │       │   Payment Modals (simulated):
│   │       │   - Razorpay Card: card number input, mock approval/failure
│   │       │   - PayPal: email input, mock approval
│   │       │   - Crypto: coin selection (USDT/BTC/ETH), mock blockchain
│   │       │   - COD: no modal, direct order
│   │       │   OTP Verification: email OTP before final order placement
│   │       │   Functions: handleCreateOrder() - validates stock, creates order,
│   │       │              clears cart, shows success
│   │       │
│   │       ├── ProfilePage.jsx     # USER PROFILE PAGE
│   │       │   Tabs:
│   │       │   1. Profile Details: name, email, address (editable)
│   │       │   2. Order History: table of past orders with status badges,
│   │       │      items, totals, dates
│   │       │   3. Wishlist: grid of favorited products
│   │       │
│   │       ├── AuthPage.jsx        # AUTHENTICATION PAGE
│   │       │   Modes:
│   │       │   - Sign In (email + password, forgot password link)
│   │       │   - Register (name + email + password)
│   │       │   - Forgot Password (email input → OTP sent)
│   │       │   - Reset Password (OTP + new password)
│   │       │   - Admin Login ("Only For Admin" form via modal/inline)
│   │       │   Features:
│   │       │   - Password show/hide toggle
│   │       │   - Form validation with field errors
│   │       │   - Loading spinner on submit
│   │       │   - "Sign In Admin" button opens admin-specific login form
│   │       │   - Toggle between Sign In / Create Account tabs
│   │       │
│   │       └── AdminDashboard.jsx  # ADMIN DASHBOARD (in main storefront)
│   │           Tabs:
│   │           1. Dashboard: 4 stat cards (Total Sales ₹, Orders Count,
│   │              Total Users, Low Stock Alerts), Area chart (7-day revenue),
│   │              Bar chart (sales by category)
│   │           2. Products (Inventories): table with CRUD, bulk delete,
│   │              create/edit modal with image upload
│   │           3. Orders (Shipments): table with status dropdown, 
│   │              address view modal with clipboard copy
│   │           4. Users (Security Role): table with role toggle, 
│   │              registration date
│   │           Auto-refresh every 10 seconds
│   │           Auto-logout on 401/403 errors
│   │
│   └── Front-end Deployment:
│       Platform: Vercel
│       Root Directory: Front-end/
│       Build Command: npm run build
│       Environment: VITE_API_URL = https://trendora-backend-ngio.onrender.com
│
├── Admin-panel/                     # === STANDALONE ADMIN PANEL ===
│   │
│   ├── index.html                   # Admin panel HTML entry
│   ├── vite.config.js              # Vite config, port 5174
│   ├── package.json                # React + Vite + lucide-react + recharts
│   ├── public/
│   │   └── favicon.svg             # Amber T logo for admin
│   │
│   └── src/
│       ├── main.jsx                # React entry
│       ├── App.jsx                 # Admin App (Login + Dashboard)
│       │   - Login page: email/password form, authenticates via API,
│       │     stores token in localStorage, redirects to dashboard
│       │   - Dashboard: tabs for Products, Orders, Users tables
│       │   - Products: list with delete
│       │   - Orders: list with status dropdown
│       │   - Users: list with block/unblock toggle
│       │
│       └── api.js                  # Custom API fetch utility
│           - Gets token from localStorage
│           - Sends Authorization: Bearer header
│           - Handles errors, auto-logout on 401
│
│   Admin-panel Deployment:
│   Platform: Vercel (separate project)
│   Root Directory: Admin-panel/
│
├── VIVA-NOTES.md                   # This file - viva preparation notes
│
└── .gitignore                      # Git ignore rules (node_modules, .env, dist)
```

---

## 5. API Endpoints Complete Reference

### Public Routes (No Authentication Required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user (name, email, password) |
| POST | `/api/auth/login` | Login user (email, password) → returns token + user |
| POST | `/api/auth/logout` | Clear auth cookie |
| POST | `/api/auth/forgot-password` | Request password reset OTP (email) |
| POST | `/api/auth/reset-password` | Reset password with OTP (email, otp, newPassword) |
| GET | `/api/products` | List products (supports search, category, brand, price range, color, size, rating, page, limit query params) |
| GET | `/api/products/:id` | Get single product by ID (legacyId or MongoDB _id) |
| GET | `/api/notifications` | Get latest 50 notifications |
| GET | `/api/health` | Health check → `{ status: "ok" }` |

### Protected Routes (Authentication Required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile (name, address fields) |
| POST | `/api/products/:id/reviews` | Add product review (rating + comment) |
| GET | `/api/cart` | Get user's cart with hydrated product data |
| PUT | `/api/cart` | Update/save user's entire cart |
| GET | `/api/wishlist` | Get user's wishlist with hydrated product data |
| PUT | `/api/wishlist` | Update/save user's wishlist |
| GET | `/api/orders` | Get user's order history (newest first) |
| POST | `/api/orders/request-otp` | Request checkout verification OTP |
| POST | `/api/orders` | Place order (requires OTP, validates stock, decrements inventory) |
| POST | `/api/notifications/read-all` | Mark all notifications as read |

### Admin Routes (Admin Role Required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard statistics (sales, counts, charts data) |
| GET | `/api/admin/products` | List all products (admin CRUD) |
| POST | `/api/admin/products` | Create new product |
| PUT | `/api/admin/products/:id` | Update existing product |
| DELETE | `/api/admin/products/:id` | Delete single product |
| POST | `/api/admin/products/bulk-delete` | Bulk delete multiple products |
| GET | `/api/admin/orders` | List all orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/role` | Change user role (user ↔ admin) |
| PUT | `/api/admin/users/:id/block` | Toggle user block/unblock |

---

## 6. Authentication System (Detailed)

### How Login Works:
1. User enters email + password on AuthPage
2. Frontend sends POST request to `/api/auth/login`
3. Backend finds user by email (with `.select("+password")`)
4. Compares password using `bcrypt.compare(password, hash)`
5. If match: generates JWT token with `jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" })`
6. Sets HTTP-only cookie with the token
7. Returns `{ token, user }` in response body
8. Frontend stores token in memory via `setToken()` and user in context state
9. All subsequent API calls include `Authorization: Bearer <token>` header

### How Registration Works:
1. User fills name, email, password
2. Frontend sends POST to `/api/auth/register`
3. Backend validates fields with express-validator
4. Checks if email already exists (returns 400 if duplicate)
5. Hashes password with bcrypt (10 salt rounds)
6. Creates User document in MongoDB
7. Generates JWT, sets cookie, returns `{ token, user }`

### How Session Persistence Works:
- JWT is stored in HTTP-only cookie (auto-sent with requests)
- Frontend also stores token in JavaScript variable for Bearer header
- `authMiddleware.js` checks cookie first, then Authorization header
- On every protected route, middleware verifies JWT and fetches user
- If token expired or invalid: returns 401 → frontend logs user out

### How Password Reset Works:
1. User clicks "Forgot Password" → enters email
2. Backend generates 6-digit random OTP
3. Hashes OTP with bcrypt, stores on user with 15-minute expiry
4. Sends OTP to user's email via Resend API
5. User enters OTP + new password
6. Backend verifies OTP (bcrypt compare) and expiry
7. Hashes new password, saves to user
8. Clears OTP fields, creates notification

---

## 7. Database Models (Detailed)

### User Model
```
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, select: false - hidden from queries),
  role: String (enum: user/admin, default: "user"),
  address: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  cart: [{ productId: String, quantity: Number, selectedColor: String, selectedSize: String }],
  favorites: [String],  // Array of product IDs
  resetOtp: String (select: false),
  resetOtpExpires: Date (select: false),
  isBlocked: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Product Model
```
{
  legacyId: String (unique, sparse - used for seed data IDs like "prod-1"),
  name: String (required),
  description: String,
  detail: String (technical details),
  price: Number (required, min: 0),
  category: String (required, indexed - e.g. "Fashion", "Tech", "Workspace"),
  brand: String (required),
  images: [String] (array of image URLs),
  colors: [String] (default: ["Default"]),
  sizes: [String] (default: ["One Size"]),
  stock: Number (default: 0),
  rating: Number (default: 5),
  reviewCount: Number (default: 0),
  reviews: [{ userName, rating, comment, createdAt, updatedAt }],
  featured: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```
Virtual field: `id` (returns legacyId or _id)

### Order Model
```
{
  legacyId: String (unique, sparse),
  userId: ObjectId (ref: User, indexed),
  customerName: String (required),
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    color: String,
    size: String
  }],
  shippingAddress: {
    fullName, street, city, state, zipCode, phone
  },
  paymentMethod: String (default: "COD"),
  paymentStatus: String (enum: Pending/Paid/Failed, default: "Pending"),
  paymentId: String,
  orderStatus: String (enum: Pending/Processing/Shipped/Delivered/Cancelled, default: "Pending"),
  totalAmount: Number (required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Notification Model
```
{
  userId: ObjectId (ref: User, null = system-wide),
  title: String (required),
  message: String (required),
  type: String (enum: system/order/rating, default: "system"),
  isRead: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 8. Data Flow Examples

### User Places an Order (Complete Flow)
```
1. User browses HomePage → Featured Treasures
2. Clicks product → ProductDetailPage loads via API
3. Selects color, size, quantity → clicks "Add to Cart"
4. Frontend updates context cart state → calls PUT /api/cart (saves to DB)
5. User clicks Cart icon → CartPage shows items with totals
6. Applies promo code "TRENDORA15" → 15% discount
7. Clicks "Proceed to Checkout" → CheckoutPage (3 steps)
8. Step 1: Review items
9. Step 2: Fill shipping address
10. Step 3: Select payment method (e.g. Card)
11. Mock payment modal opens → user enters card details → "Pay"
12. After mock success → OTP verification triggers
13. POST /api/orders/request-otp → OTP sent to email
14. User enters OTP → POST /api/orders (with items, address, payment info)
15. Backend: validates OTP, checks stock, decrements stock, creates Order, clears cart
16. Success page shown → user can view order in Profile
```

### Admin Manages Products (Complete Flow)
```
1. Admin logs in via admin form (admin@trendora.com / Asdf@295)
2. auto-routed to AdminDashboard tab
3. Stats loaded: GET /api/admin/stats → shows charts + cards
4. Products tab: GET /api/admin/products → table of all products
5. Admin clicks "Add Product" → modal opens
6. Fills name, price, category, brand, etc.
7. Uploads image (URL or drag-drop base64)
8. Clicks Save → POST /api/admin/products
9. Product appears in table
10. Admin can edit (PUT), delete (DELETE), or bulk delete (POST bulk-delete)
```

---

## 9. Seed Data (For Testing)
| Account | Email | Password | Role |
|---|---|---|---|
| Admin | admin@trendora.com | Asdf@295 | admin |
| Demo User | user@trendora.com | user123 | user |

### Sample Products
| Product | Category | Price | Rating |
|---|---|---|---|
| Vanguard Minimalist Chrono (Watch) | Fashion | $189 | 4.8 |
| AeroGlow Tactile Keyboard | Tech | $145 | 4.7 |
| Atelier Wool Trench Coat | Fashion | $299 | 4.9 |
| Quantum Buds ANC Pro | Tech | $129 | 4.6 |

---

## 11. How to Run Locally

```bash
# Step 1: Install all dependencies
npm run install:all

# Step 2: Create environment files
# Back-end/.env needs:
#   MONGODB_URI=mongodb+srv://...
#   JWT_SECRET=your_secret_key
#   RESEND_API_KEY=optional

# Front-end/.env needs:
#   VITE_API_URL=http://localhost:5000

# Step 3: Run both backend and frontend together
npm run dev

# Or run separately:
npm run dev:server   # Backend starts on port 5000
npm run dev:client   # Frontend starts on port 5173

# Step 4: Seed database (run once or on first deploy)
npm run seed

# Step 5: Open browser at http://localhost:5173
# Test credentials:
#   Admin: admin@trendora.com / Asdf@295
#   User:  user@trendora.com / user123
```
