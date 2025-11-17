import { Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";
import { ProductsProvider } from "./context/ProductsContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import EditProfile from "./pages/EditProfile";
import ForgotPasswordFlow from "./pages/ForgotPasswordFlow";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import FarmStorePage from "./pages/FarmStorePage";
import CartPage from "./pages/CartPage";
import DashboardProfileView from "./components/Dashboard/DashboardProfileView";
import DashboardProductsView from "./components/Dashboard/DashboardProductsView";
import OrdersPage from "./pages/OrdersPage";

function App() {
  return (
    // AuthProvider must be the parent
    <AuthProvider>
      {/* --- 3. CartProvider goes INSIDE AuthProvider --- */}
      <CartProvider>
        <MainLayout>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route
              path="/"
              element={
                <div className="container mx-auto px-6 py-12">
                  <h1 className="mb-4 text-4xl font-bold text-gray-900">Welcome to AgriLink</h1>
                  <p className="mb-8 text-lg text-gray-700">
                    Your connection to fresh local farms!
                  </p>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="rounded-lg bg-white p-6 shadow-md">
                      <h2 className="mb-4 text-2xl font-semibold text-emerald-600">For Farmers</h2>
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
            {/* Authentication routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Password reset routes */}
            <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            <Route
              path="/about"
              element={
                <div className="container mx-auto px-6 py-12">
                  <h1 className="text-4xl font-bold text-gray-900">About Page</h1>
                </div>
              }
            />
            <Route
              path="/contact"
              element={
                <div className="container mx-auto px-6 py-12">
                  <h1 className="text-4xl font-bold text-gray-900">Contact Page</h1>
                </div>
              }
            />

            <Route path="/discover" element={<LandingPage />} />
            <Route path="/farm/:id" element={<FarmStorePage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Dashboard with nested routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProductsProvider>
                    <Dashboard />
                  </ProductsProvider>
                </ProtectedRoute>
              }
            >
              {/* Default child route: /dashboard -> /dashboard/profile */}
              <Route index element={<Navigate to="profile" replace />} />

              {/* Child routes */}
              <Route path="profile" element={<DashboardProfileView />} />
              <Route
                path="products"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <DashboardProductsView />
                  </ProtectedRoute>
                }
              />
              <Route path="orders" element={<OrdersPage />} />
            </Route>

            {/* Edit Profile - Farmers only (customers edit in dashboard) */}
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <EditProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
