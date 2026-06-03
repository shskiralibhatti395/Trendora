# Trendora — MERN E-Commerce

Premium full-stack e-commerce built with React (Vite), Node.js, Express, and MongoDB.

## Project structure

```
Trendora/
├── client/          # React + Vite + Tailwind
├── server/          # Express + Mongoose API
├── .env.example
└── package.json     # Root scripts (run both apps)
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure the server:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set at minimum:

- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017/trendora`
- `JWT_SECRET` — long random string

3. Seed the database (demo users + products):

```bash
npm run seed
```

**Demo accounts**

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@trendora.com  | admin123  |
| User  | user@trendora.com   | user123   |

4. Start development:

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  

## Security features

- JWT in **HTTP-only cookies** (not `localStorage`)
- `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`
- `express-validator` on auth and write routes
- Admin routes protected by role middleware
- No OTP or secrets returned in API responses

## User data sync

Cart, favorites, orders, and profile are stored in **MongoDB**. Signing in on any device loads the same cart and wishlist from the server.

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Client + server together |
| `npm run dev:server` | API only              |
| `npm run dev:client` | Frontend only         |
| `npm run seed`    | Seed MongoDB             |

## Production

```bash
cd client && npm run build
cd ../server && NODE_ENV=production npm start
```

Serve `client/dist` with your host or configure the API to serve static files as needed.
