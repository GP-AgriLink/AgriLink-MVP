import { Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";
import FarmerSignup from "./pages/FarmRegister";
import FarmerLogin from "./pages/FarmLogin";
import EditProfile from "./pages/EditProfile";
import ForgotPasswordFlow from "./pages/ForgotPasswordFlow";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import FarmStorePage from "./pages/FarmStorePage";
import CartPage from "./pages/CartPage";
import DiscoverPage from "./pages/DiscoverPage";

function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Routes>
          <Route
            path="/"
            element={
              <div className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to AgriLink
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Your connection to fresh local farms!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-emerald-600 mb-4">
                      For Farmers
                    </h2>
                    <p className="text-gray-600 mb-4">
                      List your farm and connect with customers directly.
                    </p>
                    <Link
                      to="/register"
                      className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-emerald-600 mb-4">
                      For Customers
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Discover and buy from local farms in your area.
                    </p>
                    <Link
                      to="/discover"
                      className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Browse Farms
                    </Link>
                  </div>
                </div>
              </div>
            }
          />

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
          <Route
            path="/discover"
            element={<DiscoverPage />}
          />

          <Route path="/login" element={<FarmerLogin />} />
          <Route path="/register" element={<FarmerSignup />} />
          <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={<CartPage />}
          />

          <Route path="/farm/:id" element={<FarmStorePage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </AuthProvider>
  );
}

export default App;