import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; 
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';
import FarmStorePage from './pages/FarmStorePage';
import CartPage from './pages/CartPage'; 
import DiscoverPage from './pages/DiscoverPage';
// import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
// import { ProductsProvider } from "./context/ProductsContext";
// import EditProfile from "./pages/EditProfile";
// import ForgotPasswordFlow from "./pages/ForgotPasswordFlow";
// import ResetPasswordPage from "./pages/ResetPasswordPage";
// import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <AuthProvider>
      {/* 3. Wrap MainLayout (and all pages) with CartProvider */}
      <CartProvider>
        <MainLayout>
          <Routes>
            {/* --- ACTIVE ROUTES --- */}
            <Route
              path="/"
              element={
                <div className="container mx-auto px-6 py-12">
                  <h1 className="mb-4 text-4xl font-bold text-gray-900">
                    Welcome to AgriLink
                  </h1>
                  <p className="mb-8 text-lg text-gray-700">
                    Your connection to fresh local farms!
                  </p>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                      <h2 className="mb-4 text-2xl font-semibold text-emerald-600">
                        For Farmers
                      </h2>
                      <p className="mb-4 text-gray-600">
                        List your farm and connect with customers directly.
                      </p>
                      <Link
                        to="/register"
                        className="inline-block rounded-lg bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-md">
                      <h2 className="mb-4 text-2xl font-semibold text-emerald-600">
                        For Customers
                      </h2>
                      <p className="mb-4 text-gray-600">
                        Discover and buy from local farms in your area.
                      </p>
                      <Link
                        to="/discover"
                        className="inline-block rounded-lg bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
                      >
                        Browse Farms
                      </Link>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/about"
              element={
                <div className="container mx-auto px-6 py-12">
                  <h1 className="text-4xl font-bold text-gray-900">
                    About Page
                  </h1>
                </div>
              }
            />
            <Route
              path="/contact"
              element={
                <div className="container mx-auto px-6 py-12">
                  <h1 className="text-4xl font-bold text-gray-900">
                    Contact Page
                  </h1>
                </div>
              }
            />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/farm/:id" element={<FarmStorePage />} />
            
            {/* --- 4. Uncommented the CartPage route --- */}
            <Route path="/cart" element={<CartPage />} />

            {/* ---------------------- */}

            {/* --- COMMENTED OUT ROUTES --- */}
            {/*
            <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProductsProvider>
                    <Dashboard />
                  </ProductsProvider>
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <ProductsProvider>
                    <EditProfile />
                  </ProductsProvider>
                </ProtectedRoute>
              }
            />
            */}
            {/* --------------------------- */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;