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
import DashboardReportView from "./components/Dashboard/DashboardReportView";
import OrdersPage from "./pages/OrdersPage";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout>
          <Routes>
            {/* Authentication routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Password reset routes */}
            <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<LandingPage />} />

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
              <Route path="report" element={<DashboardReportView />} />
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
