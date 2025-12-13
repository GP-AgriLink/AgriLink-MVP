<div align="center">

# 🌾 AgriLink Backend

**Production-Grade Agricultural Marketplace API**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[🏠 Main Documentation](../README.md) • [🎨 Frontend Docs](../client/README.md)

[Features](#-features) • [Getting Started](#-getting-started) • [API Reference](#-api-reference)

</div>

---

## 📖 Overview

**AgriLink Backend** is a robust RESTful API server connecting farmers with customers. Built with Node.js, Express, and MongoDB, it powers a comprehensive agricultural marketplace with AI-driven features, real-time communication, and advanced analytics.

## ✨ Features

- **🔐 Secure Authentication** - JWT-based multi-role auth (Farmer/Customer)
- **🛒 E-Commerce Engine** - Complete product, cart, and order management
- **🤖 AI Integration** - Google Gemini for smart descriptions and categorization
- **💬 Real-Time Chat** - Direct messaging with conversation history
- **📍 Geolocation** - Location-based farm discovery
- **📊 Business Analytics** - Comprehensive reports and dashboards
- **☁️ Cloud Storage** - Cloudinary CDN for optimized media
- **📧 Email Service** - Automated notifications and password recovery

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.1
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini API
- **Storage**: Cloudinary
<!-- - **Security**: Helmet, CORS, Rate Limiting, JWT -->
- **Security**: CORS, JWT
- **Email**: Nodemailer

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (Atlas or local instance)
- npm or yarn

### Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### Configuration

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure required services** (see `.env.example` for details):
   - MongoDB Atlas - [Free cluster](https://www.mongodb.com/cloud/atlas)
   - Cloudinary - [Sign up](https://cloudinary.com/users/register/free)
   - Google Gemini - [Get API key](https://aistudio.google.com/app/apikey)
   - Gmail App Password - [Generate](https://support.google.com/accounts/answer/185833)

3. **Update `.env` with your credentials**

### Running the Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server will run at `http://localhost:5000`

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Database & service configurations
│   ├── controllers/      # Request handlers & business logic
│   ├── middleware/       # Auth, validation & error handling
│   ├── models/           # Mongoose schemas (User, Farm, Product, Order, Cart, Chat)
│   ├── routes/           # API endpoint definitions
│   └── utils/            # Helper functions & utilities
├── server.js             # Application entry point
├── .env.example          # Environment variables template
└── package.json          # Dependencies & scripts
```

## 🏗 Architecture

**Pattern**: MVC (Model-View-Controller) adapted for REST API

- **Routes** → Define endpoints and route to controllers
- **Controllers** → Handle requests, validate data, call services
- **Models** → Define schemas and database interactions
- **Middleware** → Cross-cutting concerns (auth, errors, validation)

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
Protected routes require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

<details>
<summary><b>🔐 Authentication & Users</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/users/register` | Register new user | ❌ |
| POST | `/users/login` | Login user | ❌ |
| GET | `/users/profile` | Get current user | ✅ |
| PUT | `/users/profile` | Update profile | ✅ |
| PUT | `/users/profile/password` | Change password | ✅ |
| POST | `/users/forgot-password` | Request password reset | ❌ |
| PUT | `/users/reset-password/:token` | Reset password | ❌ |

</details>

<details>
<summary><b>🌾 Farms</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/farms` | List all farms (paginated) | ❌ |
| GET | `/farms/:id` | Get farm by ID | ❌ |
| GET | `/farms/nearby` | Find farms by location | ❌ |
| GET | `/farms/stats` | Public statistics | ❌ |
| GET | `/farms/my-farm` | Get farmer's farm | ✅ Farmer |
| PUT | `/farms/my-farm` | Update farm | ✅ Farmer |
| GET | `/farms/my-farm/stats` | Dashboard statistics | ✅ Farmer |
| GET | `/farms/my-farm/report` | Sales reports | ✅ Farmer |

**Query Parameters** (nearby):
- `lat` - Latitude
- `lng` - Longitude  
- `maxDistance` - Search radius in meters

</details>

<details>
<summary><b>🥬 Products</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products/categories` | List all categories | ❌ |
| GET | `/products/public/farms/:farmId` | Get farm products | ❌ |
| GET | `/products/my-products` | Get farmer's products | ✅ Farmer |
| POST | `/products` | Create product | ✅ Farmer |
| PUT | `/products/:id` | Update product | ✅ Farmer |
| DELETE | `/products/:id` | Archive product | ✅ Farmer |

</details>

<details>
<summary><b>📦 Orders</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders` | Create order | ✅ Customer |
| GET | `/orders/my-orders` | Customer orders | ✅ Customer |
| GET | `/orders/incoming` | Farmer orders | ✅ Farmer |
| GET | `/orders/incoming/count` | New order count | ✅ Farmer |
| GET | `/orders/:id` | Order details | ✅ |
| PUT | `/orders/:id/status` | Update status | ✅ Farmer |

</details>

<details>
<summary><b>🛒 Cart</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart` | Get user cart | ✅ |
| POST | `/cart` | Add item | ✅ |
| DELETE | `/cart/:productId` | Remove item | ✅ |
| DELETE | `/cart` | Clear cart | ✅ |

</details>

<details>
<summary><b>🤖 AI Features</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/product-description` | Generate product description | ✅ Farmer |
| POST | `/ai/standardize-category` | Standardize category name | ✅ Farmer |
| POST | `/ai/farm-bio` | Enhance farm bio | ✅ Farmer |

</details>

<details>
<summary><b>💬 Chat</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/chat/send` | Send message | ✅ |
| GET | `/chat/history` | Get conversation | ✅ |
| DELETE | `/chat/history` | Clear conversation | ✅ |

</details>

<details>
<summary><b>📤 Upload</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/uploads` | Upload image to Cloudinary | ✅ |

</details>

## 🗄️ Database Models

<details>
<summary><b>View Schema Definitions</b></summary>

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'farmer' | 'customer',
  phone: String,
  addresses: [AddressSchema],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

### Farm
```javascript
{
  farmerId: ObjectId (ref: User),
  farmName: String,
  farmBio: String,
  location: { type: 'Point', coordinates: [lng, lat] },
  specialties: [String]
}
```

### Product
```javascript
{
  farmId: ObjectId (ref: Farm),
  name: String,
  description: String,
  category: String,
  price: Number,
  stock: Number,
  unit: 'kg' | 'piece' | 'liter',
  imageUrl: String,
  status: 'active' | 'inactive',
  isArchived: Boolean
}
```

### Order
```javascript
{
  customerId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    farmId: ObjectId (ref: Farm),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: 'pending' | 'accepted' | 'rejected' | 'completed',
  shippingAddress: AddressSchema
}
```

### Cart
```javascript
{
  userId: ObjectId (ref: User, unique),
  products: [{
    productId: ObjectId (ref: Product),
    quantity: Number
  }]
}
```

### ChatHistory
```javascript
{
  participants: [ObjectId] (ref: User),
  messages: [{
    senderId: ObjectId (ref: User),
    content: String,
    timestamp: Date,
    isRead: Boolean
  }],
  lastMessageAt: Date
}
```

</details>

## 🔒 Security Features

<!-- - ✅ **Helmet.js** - Security headers (XSS, clickjacking protection) -->
<!-- - ✅ **Rate Limiting** - DDoS protection with configurable limits -->
- ✅ **CORS** - Cross-origin resource sharing controls
- ✅ **JWT** - Secure token-based authentication
- ✅ **Bcrypt** - Password hashing with salt rounds
- ✅ **Input Validation** - Express Validator for request sanitization
<!-- - ✅ **NoSQL Injection Prevention** - Mongo Sanitize middleware -->
- ✅ **Error Handling** - Custom error middleware (no data leaks)

## 🚢 Deployment

### Quick Deploy (Railway / Render / Fly.io)

1. Connect your GitHub repository
2. Add environment variables from `.env.example`
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Deploy

### Heroku

```bash
heroku create agrilink-api
heroku config:set MONGO_URI="..." JWT_SECRET="..." # Add all vars from .env.example
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret (32+ characters)
- [ ] Configure MongoDB IP whitelist (remove `0.0.0.0/0`)
- [ ] Enable HTTPS/SSL certificates
- [ ] Update CORS for production domain only
- [ ] Setup error monitoring (Sentry/LogRocket)
- [ ] Enable MongoDB automated backups
- [ ] Configure rate limits appropriately
- [ ] Setup uptime monitoring

## 🛠️ Development

```bash
npm run dev    # Development with nodemon auto-reload
npm start      # Production mode
npm test       # Run tests (coming soon)
```

## 🙏 Acknowledgments

Built with [Express.js](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), [Cloudinary](https://cloudinary.com/), and [Google Gemini AI](https://ai.google.dev/)

---

<div align="center">

**Built with ❤️ for the agricultural community** ��

[⭐ Star this repo](../../stargazers) • [🐛 Report Issues](../../issues) • [💡 Request Features](../../issues)

</div>
