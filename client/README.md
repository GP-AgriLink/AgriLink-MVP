<div align="center">

# 🌾 AgriLink Frontend

**Modern Agricultural Marketplace Platform**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[🏠 Main Documentation](../README.md) • [⚙️ Backend Docs](../server/README.md)

[Features](#-features) • [Getting Started](#-getting-started) • [Architecture](#-architecture)

</div>

---

## 📖 Overview

**AgriLink Frontend** is a modern React application connecting local farmers directly with customers. Built with cutting-edge technologies, it delivers a seamless farm-to-table experience with AI-powered features, interactive maps, and real-time updates.

## ✨ Features

### 🚜 For Farmers

- **Product Management** - Complete CRUD operations with drag-and-drop image upload
- **AI-Powered Tools** - Auto-generate descriptions and standardize categories
- **Analytics Dashboard** - Visual sales reports with charts and trends
- **Order Management** - Real-time order notifications and status updates
- **Inventory Control** - Stock tracking and low-inventory alerts

### 🛒 For Customers

- **Smart Discovery** - Find fresh products with advanced search and filters
- **Interactive Maps** - Locate nearby farms with distance-based search
- **Seamless Shopping** - Intuitive cart with real-time price updates
- **Order Tracking** - Monitor order status from placement to completion
- **Direct Communication** - Chat with farmers for custom requests

## 🛠 Tech Stack

- **Core**: React 19.1, Vite 7.1
- **Routing**: React Router v7.9
- **Styling**: TailwindCSS 3.4, Framer Motion
- **State Management**: React Context API
- **Forms**: Formik, Yup validation
- **Maps**: Leaflet, React-Leaflet
- **HTTP**: Axios
- **UI Components**: Lucide React, React Icons
- **PDF Generation**: React-PDF
- **Notifications**: React Toastify

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Backend API running (see [server README](../server/README.md))

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install
```

### Configuration

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your backend URL**
   ```env
   VITE_APP_API_URL=http://localhost:5000
   ```

### Running the Application

```bash
# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

Application will run at `http://localhost:5173`

## 📁 Project Structure

```
client/
├── public/               # Static assets (fonts, images)
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Auth/        # Authentication forms
│   │   ├── Cart/        # Shopping cart components
│   │   ├── Dashboard/   # Farmer dashboard views
│   │   ├── Discover/    # Landing page sections
│   │   ├── FarmStore/   # Farm storefront
│   │   ├── Map/         # Map integrations
│   │   ├── Navbar/      # Navigation
│   │   └── ...
│   ├── config/          # API configuration
│   ├── context/         # Global state management
│   │   ├── AuthContext  # User authentication
│   │   ├── CartContext  # Shopping cart
│   │   ├── ProductsContext
│   │   └── OrdersContext
│   ├── pages/           # Route pages/views
│   ├── services/        # API service layer
│   │   ├── authService
│   │   ├── farmApi
│   │   ├── productApi
│   │   ├── orderApi
│   │   ├── aiService
│   │   └── ...
│   ├── utils/           # Helper functions & utilities
│   ├── App.jsx          # Main app component & routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── .env.example         # Environment template
└── package.json         # Dependencies & scripts
```

## 🏗 Architecture

### Design Patterns

- **Service Layer** - All API calls centralized in `src/services/` for consistency
- **Context API** - Global state (Auth, Cart, Products, Orders) via React Context
- **Protected Routes** - Role-based access control (Farmer/Customer routes)
- **Component Composition** - Reusable, maintainable component structure
- **Custom Hooks** - Shared logic extraction for better code reuse

### State Management

```javascript
// Global Context Providers
- AuthContext      → User authentication & authorization
- CartContext      → Shopping cart state & operations  
- ProductsContext  → Product catalog & filtering
- OrdersContext    → Order management & tracking
```

### Service Layer Architecture

```javascript
// Example: Service structure
services/
  authService.js   → Login, Register, Password Reset
  farmApi.js       → Farm CRUD operations
  productApi.js    → Product management
  orderApi.js      → Order processing
  aiService.js     → AI integrations (Gemini)
  uploadService.js → Image uploads (Cloudinary)
```

## 🎨 Styling & UI

- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Responsive Design** - Mobile-first approach
- **Dark Mode Ready** - Theme support architecture
- **Accessibility** - ARIA labels and keyboard navigation

## 🔒 Security

- ✅ JWT token management with automatic refresh
- ✅ Protected routes with authentication guards
- ✅ Input sanitization (DOMPurify)
- ✅ Form validation (Yup schemas)
- ✅ XSS protection
- ✅ Secure API communication

## 📦 Key Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `react` | UI framework | 19.1 |
| `react-router-dom` | Routing | 7.9 |
| `axios` | HTTP client | 1.13 |
| `formik` | Form management | 2.4 |
| `yup` | Validation schemas | 1.7 |
| `leaflet` | Maps | 1.9 |
| `framer-motion` | Animations | 12.23 |
| `@react-pdf/renderer` | PDF generation | 4.3 |
| `react-toastify` | Notifications | 11.0 |

## 🛠️ Development Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Create production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint for code quality
```

## 🌐 Environment Variables

```env
# Backend API URL
VITE_APP_API_URL=http://localhost:5000

# Add other variables as needed
```

> All environment variables must be prefixed with `VITE_` to be accessible in the application.

## 📱 Pages & Routes

| Route | Component | Description | Auth |
|-------|-----------|-------------|------|
| `/` | LandingPage | Homepage with features | Public |
| `/login` | LoginPage | User authentication | Public |
| `/register` | RegisterPage | User registration | Public |
| `/discover` | AboutPage | Farm discovery | Public |
| `/farms/:id` | FarmStorePage | Farm products | Public |
| `/cart` | CartPage | Shopping cart | Customer |
| `/orders` | OrdersPage | Order history | Customer |
| `/dashboard` | Dashboard | Farmer dashboard | Farmer |
| `/profile` | ProfilePage | User profile | Auth |

## 🎯 Performance Optimization

- ✅ Code splitting with React.lazy()
- ✅ Image lazy loading
- ✅ Intersection Observer for scroll animations
- ✅ Memoization with React.memo
- ✅ Virtualized lists for large datasets
- ✅ Optimized bundle size with Vite

## 🙏 Acknowledgments

Built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [TailwindCSS](https://tailwindcss.com/), and [Leaflet](https://leafletjs.com/)

---

<div align="center">

**Built with ❤️ for the agricultural community** 🌾

[⭐ Star this repo](../../stargazers) • [🐛 Report Issues](../../issues) • [💡 Request Features](../../issues)

</div>
