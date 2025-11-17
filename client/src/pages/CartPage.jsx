import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/cartApi';
import CartBanner from '../components/Cart/CartBanner';
import CartSummary from '../components/Cart/CartSummary';
import EmptyCart from '../components/Cart/EmptyCart';
import { FiCheckCircle } from 'react-icons/fi';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    totalDue,
    groupedByFarm,
    isLoading: isCartLoading,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmitOrder = async () => {
    if (!user || user.role !== 'customer') {
      toast.error('You must be logged in as a customer to place an order.');
      navigate('/login-customer', { state: { from: '/cart' } });
      return;
    }

    if (cartCount === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    // Validation: Check if user has real name
    // Option 1: If you have firstName & lastName
    const hasFirstName = user.firstName && user.firstName.trim().length > 0;
    const hasLastName = user.lastName && user.lastName.trim().length > 0;
    
    // Option 2: If you have fullName only (uncomment if needed)
    // const hasFullName = user.fullName && user.fullName.trim().length > 0;
    
    if (!hasFirstName || !hasLastName) {
      toast.error('Please complete your profile with your real first and last name before placing an order.', {
        autoClose: 5000,
      });
      navigate('/edit-profile', { state: { from: '/cart', requireName: true } });
      return;
    }

    setIsSubmitting(true);

    try {
      // NEW: Send empty body - backend reads cart from token
      const orders = await createOrder();
      
      // Backend returns array of orders (one per farm)
      const orderCount = orders.length;

      const farmNames = Object.values(groupedByFarm)
      .map(group => group.farm.farmName) 
      .join(', ');  
          
      toast.success(
        `🎉 ${orderCount} order${orderCount > 1 ? 's' : ''} placed successfully! Orders from: ${farmNames}`,
        { autoClose: 5000 }
      );
      
      navigate('/dashboard/orders');
      
      // Clear cart after navigation
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage, { autoClose: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (cartCount === 0) {
    return <EmptyCart />;
  }

  const farmCount = Object.keys(groupedByFarm).length;

  return (
    <div className="min-h-screen bg-emerald-50/50 py-6 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <CartBanner totalDue={totalDue} groupedByFarm={groupedByFarm} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <CartSummary
              groupedByFarm={groupedByFarm}
              total={totalDue}
              itemCount={cartCount}
              onQuantityChange={updateQuantity}
              onRemoveItem={removeFromCart}
              onClearAll={clearCart}
            />
          </div>

          <div className="lg:col-span-1">
            {/* Name Validation Warning */}
            {user && (!user.firstName || !user.lastName || 
              user.firstName.trim().length === 0 || user.lastName.trim().length === 0) && (
              <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      Profile Incomplete
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                      You need to add your real first and last name before placing orders. This helps farms identify and contact you properly.
                    </p>
                    <button
                      onClick={() => navigate('/edit-profile', { state: { from: '/cart', requireName: true } })}
                      className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-all"
                    >
                      Complete Your Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 h-fit sticky top-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Order?
              </h2>
              
              {farmCount > 1 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold mb-2">
                    ℹ️ You're ordering from {farmCount} farms:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 ml-4">
                    {Object.values(groupedByFarm).map((group, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <strong>{group.farm.farmName}</strong>
                        <span className="text-blue-600">- ${group.total.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-blue-600 mt-3">
                    Each farm will receive a separate order.
                  </p>
                </div>
              )}
              
              <p className="text-sm text-emerald-800 mb-6">
                Your account details will be used for {farmCount > 1 ? 'all orders' : 'the order'}.
                {farmCount > 1 ? ' Each farm' : ' The farm'} will contact you at{' '}
                <strong>{user?.phone || 'your phone number'}</strong> to confirm delivery.
              </p>
              
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={
                  isSubmitting || 
                  isCartLoading || 
                  !user?.firstName || 
                  !user?.lastName ||
                  user.firstName.trim().length === 0 ||
                  user.lastName.trim().length === 0
                }
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiCheckCircle className="w-5 h-5" />
                {isSubmitting
                  ? 'Placing Orders...'
                  : `Confirm ${farmCount > 1 ? `${farmCount} Orders` : 'Order'} (Pay on Delivery)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;