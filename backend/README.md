# E-Commerce Backend API

A fully functional Node.js backend for e-commerce applications with Express.js, MongoDB, and Razorpay payment integration.

## Features

- ✅ User authentication with JWT
- ✅ Role-based access control (User/Admin)
- ✅ Product CRUD with search, filter, and pagination
- ✅ Order management with status tracking
- ✅ Razorpay payment integration with webhook support
- ✅ Input validation and error handling
- ✅ Security middleware (Helmet, CORS)
- ✅ Request logging with Morgan

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
```

### 3. Set Up MongoDB

Get a free MongoDB cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) and add the connection string to `.env`.

### 4. Set Up Razorpay

1. Create account at [Razorpay](https://razorpay.com/)
2. Get API keys from Dashboard → Settings → API Keys
3. Add keys to `.env`

### 5. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 6. Seed Sample Data (Optional)

```bash
npm run seed
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |
| PUT | `/api/auth/update-password` | Update password |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get single user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |
| POST | `/api/products/:id/reviews` | Add review |
| GET | `/api/products/categories` | Get categories |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get my orders |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/orders/admin/all` | Get all orders (Admin) |
| PUT | `/api/orders/:id/status` | Update status (Admin) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| POST | `/api/payments/webhook` | Razorpay webhook |
| GET | `/api/payments/order/:orderId` | Get payment by order |
| POST | `/api/payments/:id/refund` | Initiate refund (Admin) |

## Connecting with Frontend

### 1. API Base URL

Add to your frontend environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Example API Calls

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { data } = await response.json();
localStorage.setItem('token', data.token);

// Authenticated Request
const products = await fetch('http://localhost:5000/api/products', {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem('token')}` 
  }
});

// Razorpay Payment
const options = {
  key: RAZORPAY_KEY_ID,
  amount: order.amount,
  order_id: order.razorpayOrderId,
  handler: async (response) => {
    await fetch('http://localhost:5000/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderId: order._id
      })
    });
  }
};
const razorpay = new Razorpay(options);
razorpay.open();
```

## Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection
│   └── razorpay.js      # Razorpay instance
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── productController.js
│   ├── orderController.js
│   └── paymentController.js
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── errorHandler.js  # Global error handler
│   └── validators.js    # Request validation
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── Payment.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── paymentRoutes.js
├── .env.example
├── package.json
├── seeder.js
├── server.js
└── README.md
```

## Default Test Credentials

After running seeder:
- **Admin**: admin@example.com / admin123
- **User**: john@example.com / user123
