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
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework for building REST APIs |
| **MongoDB** (Atlas) | NoSQL database (cloud-hosted) |
| **Mongoose** | MongoDB ODM (Object Data Modeling) |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Resend** | Email sending (OTP for password reset & checkout) |
| **express-rate-limit** | API rate limiting (200 requests / 15 min) |
| **helmet** | Security headers |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **cors** | Cross-Origin Resource Sharing |
| **cookie-parser** | Parse HTTP cookies |
| **express-validator** | Request validation |

### Frontend (Client-side)
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** | Build tool and dev server |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **lucide-react** | Icons |
| **recharts** | Charts (admin dashboard) |
| **motion** | Animations |

### Database
- **MongoDB Atlas** (cloud MongoDB)
- Collections: `users`, `products`, `orders`, `notifications`

### Deployment
- **Front-end** → Vercel
- **Back-end** → Render
- **Admin Panel** → Vercel (separate)

---

## 4. Project Architecture

```
Trendora/
├── Back-end/          # Express API server (Node.js + MongoDB)
│   ├── server.js      # Entry point
│   ├── config/        # Database connection
│   ├── models/        # Mongoose schemas (User, Product, Order, Notification)
│   ├── controllers/   # Business logic (auth, product, cart, order, admin)
│   ├── routes/        # API route definitions
│   ├── middleware/     # Auth, admin check, error handling, validators
│   └── utils/         # Token generation, email, seed data
│
├── Front-end/         # React storefront (Vite)
│   ├── src/
│   │   ├── App.jsx          # Main app with tab-based routing
│   │   ├── context/         # Global state (StoreContext)
│   │   ├── services/        # API calls (auth, product, cart, order, admin)
│   │   ├── components/      # Header, Footer
│   │   └── pages/           # Home, Products, ProductDetail, Cart, Checkout,
│   │                          Profile, Auth, AdminDashboard
│
└── Admin-panel/       # Standalone admin app (separate React + Vite)
    └── src/
        ├── App.jsx          # Login + Dashboard with CRUD
        └── api.js           # API fetch with token
```

---

## 5. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get user profile |
| PUT | /api/auth/profile | Yes | Update profile |
| POST | /api/auth/forgot-password | No | Send OTP for password reset |
| POST | /api/auth/reset-password | No | Reset password with OTP |
| GET | /api/products | No | List products (with search/filter/pagination) |
| GET | /api/products/:id | No | Get single product |
| POST | /api/products/:id/reviews | Yes | Add product review |
| GET | /api/cart | Yes | Get cart |
| PUT | /api/cart | Yes | Update cart |
| GET | /api/wishlist | Yes | Get wishlist |
| PUT | /api/wishlist | Yes | Update wishlist |
| GET | /api/orders | Yes | Get user orders |
| POST | /api/orders/request-otp | Yes | Request checkout OTP |
| POST | /api/orders | Yes | Place order |
| GET | /api/admin/stats | Admin | Dashboard statistics |
| GET | /api/admin/products | Admin | List all products (admin) |
| POST | /api/admin/products | Admin | Create product |
| PUT | /api/admin/products/:id | Admin | Update product |
| DELETE | /api/admin/products/:id | Admin | Delete product |
| POST | /api/admin/products/bulk-delete | Admin | Bulk delete products |
| GET | /api/admin/orders | Admin | List all orders |
| PUT | /api/admin/orders/:id/status | Admin | Update order status |
| GET | /api/admin/users | Admin | List all users |
| PUT | /api/admin/users/:id/role | Admin | Change user role |
| GET | /api/notifications | No | Get notifications |
| GET | /api/health | No | Health check |

---

## 6. Authentication System
- **JWT (JSON Web Token)** based authentication
- Token stored in HTTP-only cookie + returned in response body
- Front-end also sends token via `Authorization: Bearer <token>` header
- Password hashed with **bcryptjs** (10 salt rounds)
- Rate limiting: 200 requests per 15 minutes on auth routes

---

## 7. Database Models

**User:** name, email, password (hashed), role (user/admin), address, cart items, favorites, resetOtp

**Product:** name, description, price, category, brand, images, colors, sizes, stock, rating, reviews (embedded), featured

**Order:** userId, items (productId, name, price, qty), shippingAddress, paymentMethod, paymentStatus, orderStatus, totalAmount

**Notification:** title, message, type (system/order/rating), userId, isRead

---

## 8. Seed Data (for testing)
- **Admin**: admin@trendora.com / Asdf@295
- **Demo User**: user@trendora.com / user123
- **4 Products**: Watch ($189), Keyboard ($145), Coat ($299), Earbuds ($129)

---

## 9. Important Viva Questions & Answers

**Q: What is the project about?**
A: Trendora is a full-stack e-commerce web application where users can browse, search, and purchase products online. It has user authentication, shopping cart, wishlist, multiple payment methods (simulated), order tracking, and an admin panel for management.

**Q: What tech stack did you use?**
A: I used the MERN stack — MongoDB for database, Express.js and Node.js for backend, React for frontend. I used Vite as build tool, Tailwind CSS for styling, JWT for authentication, and bcryptjs for password hashing.

**Q: How does authentication work?**
A: When a user logs in, the server creates a JWT token and sends it back. The frontend stores this token and sends it with every API request in the Authorization header. The server verifies the token to identify the user. Passwords are hashed using bcrypt before storing in MongoDB.

**Q: How did you handle security?**
A: I used helmet for HTTP security headers, express-rate-limit to prevent brute force attacks, express-mongo-sanitize to prevent NoSQL injection, bcryptjs for password hashing, and JWT for secure authentication.

**Q: What payment methods are integrated?**
A: The project simulates four payment methods — Credit/Debit Card (mock Razorpay), PayPal, Cryptocurrency (USDT/BTC/ETH), and Cash on Delivery. These are simulated for demonstration purposes.

**Q: What is the admin panel?**
A: The admin panel is a separate React application where the admin can manage products (add/edit/delete), view and update orders, manage users (change roles, block), and see dashboard statistics with charts.

**Q: How is the data stored?**
A: Data is stored in MongoDB Atlas (cloud database). There are four collections: users, products, orders, and notifications. Mongoose is used to define schemas and interact with the database.

**Q: How did you deploy the project?**
A: The frontend is deployed on Vercel, the backend on Render, and the admin panel separately on Vercel. The backend has a seed script that runs on every deployment to populate initial data.

**Q: What challenges did you face?**
A: (Your answer here — e.g., CORS issues between Vercel and Render, authentication token management, cart persistence across sessions, etc.)

**Q: What would you improve if you had more time?**
A: (Your answer here — e.g., real payment gateway integration, product image upload to cloud storage, real-time notifications via WebSockets, unit tests, etc.)

---

## 10. How to Run Locally

```bash
# Install all dependencies
npm run install:all

# Create .env files (Back-end/.env, Front-end/.env)
# Back-end .env needs: MONGODB_URI, JWT_SECRET, RESEND_API_KEY (optional)

# Run both backend and frontend
npm run dev

# Or run separately:
npm run dev:server   # Backend on port 5000
npm run dev:client   # Frontend on port 5173

# Seed database
npm run seed
```
