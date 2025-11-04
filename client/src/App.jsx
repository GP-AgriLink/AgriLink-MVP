import { Routes, Route, Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'; // <-- (1) اتأكد إن ده موجود
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import FarmerSignup from './pages/FarmRegister'
import FarmerLogin from './pages/FarmLogin'
import EditProfile from './pages/EditProfile';
import ForgotPasswordFlow from './pages/ForgotPasswordFlow';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import CartPage from './pages/CartPage'; // <-- (2) ده سطر الإمبورت بتاع الكارت
import FarmStorePage from './pages/FarmStorePage'; // (ده بتاع الستور)

function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* (اتأكد إنك مغلّف بـ CartProvider) */}
        <div className="app min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
          <Navbar />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{ zIndex: 99999 }}
          />
          <main className="main-content w-full lg:w-5/6 mx-auto flex-grow px-4 sm:px-6 lg:px-0">
            <Routes>
              {/* ... (باقي الروتس زي ما هي) ... */}
              <Route path="/" element={ <div>...Home Page...</div> } />
              
              <Route path="/farm/:id" element={<FarmStorePage />} />

              <Route path="/login" element={<FarmerLogin />} />
              <Route path="/register" element={<FarmerSignup />} />
              <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/edit-profile" element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } />
              
\              <Route path="/cart" element={<CartPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;