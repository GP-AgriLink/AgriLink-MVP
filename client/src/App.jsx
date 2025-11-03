// src/App.jsx

import { Routes, Route, Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'; 
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
import CartPage from './pages/CartPage'; 
import FarmStorePage from './pages/FarmStorePage'; // <-- 2. اتأكد إن دي موجودة

function App() {
  return (
    <AuthProvider>
      <CartProvider> {/* <-- 3. تغليف المشروع بالمخزن */}
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
              {/* ... (Home route) ... */}
              <Route path="/" element={ <div>...Home Page...</div> } />
              
              {/* --- 4. إضافة الـ Route لصفحة المتجر --- */}
              <Route path="/farm/:id" element={<FarmStorePage />} />

              {/* ... (باقي الـ Routes زي ما هي) ... */}
              <Route path="/login" element={<FarmerLogin />} />
              <Route path="/register" element={<FarmerSignup />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider> {/* <-- 5. قفل المخزن */}
    </AuthProvider>
  );
}

export default App;