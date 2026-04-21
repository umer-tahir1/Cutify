# Cutify Backend API Documentation

## Overview
Production-ready Node.js + Express + TypeScript + MongoDB backend for the Cutify ecommerce platform.

## Quick Start

### Prerequisites
- **Node.js** >= 18
- **MongoDB** running on `localhost:27017` (or configure `MONGODB_URI` in `.env`)

### Setup
```bash
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

### Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample data |

### Default Credentials (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@cutify.com | Admin@123456 |
| Test User | sarah@example.com | User@123456 |

---

## API Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Health Check
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | API health check |

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| POST | `/auth/logout` | Yes | Logout user |
| POST | `/auth/refresh-token` | No | Refresh access token |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password with token |
| GET | `/auth/me` | Yes | Get current user |

### User Profile (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | Yes | Get user profile |
| PUT | `/users/profile` | Yes | Update user profile |
| PUT | `/users/change-password` | Yes | Change password |
| GET | `/users/addresses` | Yes | Get saved addresses |
| POST | `/users/addresses` | Yes | Add new address |
| PUT | `/users/addresses/:addressId` | Yes | Update address |
| DELETE | `/users/addresses/:addressId` | Yes | Delete address |

### Products (`/api/products`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | No | List products (paginated, filterable) |
| GET | `/products/featured/best-sellers` | No | Get best sellers |
| GET | `/products/:idOrSlug` | No | Get single product |

**Product Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (createdAt, price, rating, name)
- `order` - Sort order (asc/desc)
- `category` - Filter by category slug or ID
- `search` - Full-text search
- `minPrice` / `maxPrice` - Price range filter
- `inStock` - Filter in-stock only (true/false)
- `isBestSeller` - Filter best sellers (true/false)

### Categories (`/api/categories`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | List all categories |
| GET | `/categories/:idOrSlug` | No | Get single category |
| GET | `/categories/:idOrSlug/products` | No | Get category products |

### Cart (`/api/cart`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | Yes | Get user's cart |
| POST | `/cart/items` | Yes | Add item to cart |
| PUT | `/cart/items/:itemId` | Yes | Update item quantity |
| DELETE | `/cart/items/:itemId` | Yes | Remove item from cart |
| DELETE | `/cart` | Yes | Clear cart |
| POST | `/cart/coupon` | Yes | Apply coupon to cart |
| DELETE | `/cart/coupon` | Yes | Remove coupon |

### Wishlist (`/api/wishlist`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | Yes | Get wishlist |
| POST | `/wishlist` | Yes | Add to wishlist |
| DELETE | `/wishlist/:productId` | Yes | Remove from wishlist |
| GET | `/wishlist/check/:productId` | Yes | Check if in wishlist |
| DELETE | `/wishlist/clear` | Yes | Clear wishlist |

### Orders (`/api/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders/checkout` | Yes | Place order (checkout) |
| GET | `/orders` | Yes | Get user's orders |
| GET | `/orders/:id` | Yes | Get single order |
| PUT | `/orders/:id/cancel` | Yes | Cancel order |
| GET | `/orders/:id/track` | Yes | Track order |

### Reviews (`/api/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/product/:productId` | No | Get product reviews |
| POST | `/reviews` | Yes | Create review |
| PUT | `/reviews/:id` | Yes | Update review |
| DELETE | `/reviews/:id` | Yes | Delete review |

### Coupons (`/api/coupons`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/coupons/validate` | No | Validate coupon code |

---

## Admin Endpoints (`/api/admin`)
All admin routes require admin authentication.

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Full dashboard stats, revenue, trends |

### Admin Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/products` | List all products (inc. inactive) |
| POST | `/admin/products` | Create product |
| PUT | `/admin/products/:id` | Update product |
| DELETE | `/admin/products/:id` | Delete product |
| POST | `/admin/products/:id/images` | Upload product images |

### Admin Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/categories` | List all categories |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |
| POST | `/admin/categories/:id/images` | Upload category images |

### Admin Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | List all orders (filterable) |
| GET | `/admin/orders/:id` | Get order details |
| PUT | `/admin/orders/:id/status` | Update order status |

### Admin Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/coupons` | List all coupons |
| GET | `/admin/coupons/:id` | Get coupon details |
| POST | `/admin/coupons` | Create coupon |
| PUT | `/admin/coupons/:id` | Update coupon |
| DELETE | `/admin/coupons/:id` | Delete coupon |

### Admin Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/:id/role` | Update user role |
| PUT | `/admin/users/:id/status` | Toggle user active status |

### Admin Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/inventory` | Inventory report (low stock, out of stock) |

---

## Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Architecture
```
server/
├── src/
│   ├── config/          # App config, database connection
│   ├── controllers/     # Route handlers (business logic)
│   ├── middleware/       # Auth, validation, error handling, uploads
│   ├── models/          # Mongoose schemas & models
│   ├── routes/          # Express route definitions
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # JWT, email, pagination helpers
│   └── server.ts        # Entry point
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## Security Features
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 req/15min general, 20 req/15min auth)
- Helmet security headers
- CORS protection
- Input validation on all endpoints
- Admin route protection
- Data sanitization

## Available Coupon Codes (Seeded)
| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| CUTIFY10 | 10% off | max ₹200 | ₹500 |
| WELCOME20 | 20% off | max ₹500 | ₹300 |
| FLAT100 | ₹100 off | - | ₹999 |
| SUMMER25 | 25% off | max ₹750 | ₹700 |
