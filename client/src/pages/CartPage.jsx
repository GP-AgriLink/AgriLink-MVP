
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient, { API_ENDPOINTS } from '../config/api';
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
    farmId,
    isLoading: isCartLoading,
  } = useCart();

  const [farmInfo, setFarmInfo] = useState(null);
  const [isFarmLoading, setIsFarmLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); //

  useEffect(() => {
    const loadFarmData = async () => {
      if (!farmId) {
        setFarmInfo(null);
        setIsFarmLoading(false);
        return;
      }

      setIsFarmLoading(true);
      setError(null);
      try {
        const farmRes = await apiClient.get(API_ENDPOINTS.farms.byId(farmId));
        setFarmInfo(farmRes.data);
      } catch (err) {
        console.error('Error loading farm info:', err);
        setError('Could not load farm data.');
        toast.error('Could not load farm data.');
      } finally {
        setIsFarmLoading(false);
      }
    };

    loadFarmData();
  }, [farmId]);


  const handleSubmitOrder = async () => {
    if (!user || user.role !== 'customer') {
      toast.error('You must be logged in as a customer to place an order.');
      navigate('/login-customer', { state: { from: '/cart' } });
      return;
    }

    if (!farmId) {
      toast.error('Cart error: Farm information is missing.');
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      farmId: farmId,
      orderItems: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }; //

    try {
      await createOrder(orderData); //
      toast.success('Order placed successfully! The farm will be notified.', {
        autoClose: 5000,
      });
      clearCart();
      navigate('/my-orders');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage, { autoClose: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading || (isFarmLoading && cartItems.length > 0)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-red-600">
        {error}
      </div>
    );
  }

  if (cartCount === 0) {
    // --- TEMPORARY TEST BUTTON REMOVED ---
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-emerald-50/50 py-6 md:py-12 px-4">

      <div className="max-w-6xl mx-auto">
        <CartBanner totalDue={totalDue} farmName={farmInfo?.farmName} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <CartSummary
              items={cartItems}
              total={totalDue}
              itemCount={cartCount}
              onQuantityChange={updateQuantity}
              onRemoveItem={removeFromCart}
              onClearAll={clearCart}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 h-fit">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Order?
              </h2>
              <p className="text-sm text-emerald-800 mb-6">
                Your account details will be used for the order. The farm will
                contact you at{' '}
                <strong>{user?.phone || 'your phone number'}</strong> to
                confirm delivery.
              </p>
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || isCartLoading || isFarmLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiCheckCircle className="w-5 h-5" />
                {isSubmitting
                  ? 'Placing Order...'
                  : 'Confirm Order (Pay on Delivery)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;