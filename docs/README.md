# 🛍️ ManoHari — Full-Stack E-Commerce Platform

> A production-ready, AJIO-inspired e-commerce platform built with Java Spring Boot, MongoDB, and Next.js 14.

---

## ✨ Features

### 🛒 Shopping Experience

- Home page with hero banners, category grid, featured products, new arrivals
- **Smart Search** with real-time product suggestions as you type (sensitive autocomplete)
- Product detail pages with image gallery, color/size variants, ratings
- Cart with dynamic total calculation, free delivery threshold
- Checkout with saved addresses + add new address
- **Real Razorpay payment** — UPI, Cards, Net Banking, Wallets

### 🔐 Authentication

- Email + OTP verification signup
- Phone number + OTP verification signup
- Google OAuth2 (one-click sign in)
- Password login (email or phone)
- Phone OTP login
- Forgot/reset password with OTP
- JWT access + refresh tokens

### 👤 User Profile

- View/edit profile (name, email, phone)
- Profile photo upload (Cloudinary)
- Multiple saved addresses (set default)
- Order history with status timeline
- Order cancellation

### 🛠️ Admin Panel (`/admin`)

- **Dashboard** — stats: total products, orders, users, revenue, recent orders
- **Product Management** — add/edit/delete products with multi-image upload, variants (color/size), specifications, pricing, stock, featured toggle
- **Order Management** — view all orders, update status (Confirmed → Processing → Shipped → Delivered), view details, payment info
- **User Management** — list all users, block/unblock, create new admins
- Separate URL and credential-protected access

---

## 🏗️ Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Backend    | Java 21, Spring Boot 3.2, Spring Security |
| Database   | MongoDB (Atlas or self-hosted)            |
| Cache/OTP  | Redis                                     |
| Auth       | JWT + Google OAuth2                       |
| Payments   | Razorpay                                  |
| SMS        | Twilio                                    |
| Email      | Spring Mail (Gmail SMTP)                  |
| Images     | Cloudinary                                |
| Frontend   | Next.js 14, TypeScript, Tailwind CSS      |
| State      | Zustand                                   |
| Data fetch | TanStack React Query                      |
| Forms      | React Hook Form + Zod                     |

---

## 🚀 Quick Start

### Prerequisites

- Java 21+
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)

### 1. Clone & Configure Backend

```bash
cd backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Fill in your environment variables (see docs/PRIVATE_README.md)
```

### 2. Run Backend

```bash
docker run --name redis-server -p 6379:6379 -d redis #In other terminal 
cd backend
./mvnw spring-boot:run
# Server starts on http://localhost:8080
```

On first run, super admin `vakshat804@gmail.com` is auto-created.

### 3. Run Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8080/api
npm install
npm run dev
# App starts on http://localhost:3000
```

---

## 📁 Project Structure

```
manohariproject/
├── backend/
│   └── src/main/java/com/manohari/
│       ├── controller/       # REST endpoints
│       ├── service/          # Business logic
│       ├── repository/       # MongoDB queries
│       ├── model/            # Data models (User, Product, Order, Cart)
│       ├── dto/              # Request/response DTOs
│       ├── security/         # JWT, OAuth2, UserDetails
│       ├── config/           # Security, Cloudinary, DataInitializer
│       └── exception/        # Global error handler
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Home
│       │   ├── product/[id]/         # Product detail
│       │   ├── search/               # Search & browse
│       │   ├── cart/                 # Shopping cart
│       │   ├── checkout/             # Checkout + address
│       │   ├── orders/               # Order history
│       │   ├── profile/              # User profile
│       │   ├── auth/                 # Login, Register, OTP, OAuth2
│       │   └── admin/                # Admin panel
│       ├── components/       # Reusable UI components
│       ├── lib/api.ts        # All API calls (axios)
│       ├── store/            # Zustand (auth, cart)
│       └── hooks/            # Custom hooks (useDebounce)
│
└── docs/
    ├── README.md             # This file
    └── PRIVATE_README.md     # 🔐 Credentials & secrets (DO NOT COMMIT)
```

---

## 🌐 API Endpoints

### Public

| Method | Path                            | Description                           |
| ------ | ------------------------------- | ------------------------------------- |
| POST   | `/auth/register/email`        | Register with email                   |
| POST   | `/auth/verify/email-otp`      | Verify email OTP                      |
| POST   | `/auth/register/phone`        | Register with phone                   |
| POST   | `/auth/verify/phone-otp`      | Verify phone OTP                      |
| POST   | `/auth/login`                 | Login (email/phone + password)        |
| POST   | `/auth/send-otp/phone`        | Send phone login OTP                  |
| POST   | `/auth/login/phone-otp`       | Login with phone OTP                  |
| GET    | `/products`                   | List products (paginated, filterable) |
| GET    | `/products/{id}`              | Product detail                        |
| GET    | `/products/featured`          | Featured products                     |
| GET    | `/search?q=`                  | Full-text search                      |
| GET    | `/search/suggest-products?q=` | Autocomplete suggestions              |

### Authenticated (Bearer Token)

| Method   | Path                       | Description                          |
| -------- | -------------------------- | ------------------------------------ |
| GET      | `/users/me`              | Get profile                          |
| PUT      | `/users/me`              | Update profile                       |
| GET/POST | `/cart`                  | Cart operations                      |
| POST     | `/orders`                | Place order (creates Razorpay order) |
| POST     | `/orders/verify-payment` | Confirm payment                      |
| GET      | `/orders`                | My orders                            |

### Admin (`/admin/**`)

| Method | Path                          | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| GET    | `/admin/dashboard/stats`    | Dashboard data                  |
| POST   | `/admin/products`           | Create product (multipart)      |
| PUT    | `/admin/products/{id}`      | Update product                  |
| GET    | `/admin/orders`             | All orders                      |
| PATCH  | `/admin/orders/{id}/status` | Update order status             |
| GET    | `/admin/users`              | All users                       |
| POST   | `/admin/create-admin`       | Create admin (SUPER_ADMIN only) |

---

## 💰 Payment Flow

```
User clicks "Pay ₹X"
       ↓
Backend creates Razorpay Order (returns razorpay_order_id)
       ↓
Frontend opens Razorpay checkout popup
       ↓
User pays (UPI / Card / Net Banking / Wallet)
       ↓
Razorpay calls handler with payment_id + signature
       ↓
Backend verifies HMAC-SHA256 signature
       ↓
Order status → CONFIRMED, cart cleared, confirmation email sent
       ↓
Settlement → UPI ID: 7634066879@ptyes
```

---

## 📱 Screenshots

| Page     | Description                                                   |
| -------- | ------------------------------------------------------------- |
| Home     | Hero banner, categories, featured products, new arrivals      |
| Search   | Real-time suggestions below search box, filters, sort         |
| Product  | Image gallery, variants, size picker, add to cart             |
| Cart     | Items, quantities, free delivery badge, checkout              |
| Checkout | Address selection/creation, order summary, Razorpay pay       |
| Profile  | Edit info, avatar upload, saved addresses                     |
| Admin    | Dashboard cards, product CRUD with image upload, order status |

---

## 🔒 Security

- Passwords hashed with BCrypt
- JWT with 1-day access + 7-day refresh tokens
- OTPs stored in Redis with 10-minute TTL, single-use
- CORS configured for specific origins
- Admin routes protected by role-based access (`ROLE_ADMIN`, `ROLE_SUPER_ADMIN`)
- Razorpay payments verified with HMAC-SHA256 signature

---

## 📧 Contact

Built with ❤️ for ManoHari Fashion & Lifestyle.
Payment inquiries: UPI `7634066879@ptyes`
