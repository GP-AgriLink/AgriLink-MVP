import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient, { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { submitOrder } from '../services/cartApi';
import { sanitizeName, sanitizePhone } from '../utils/sanitizers';
import CartBanner from '../components/Cart/CartBanner';
import CartSummary from '../components/Cart/CartSummary';
import ContactForm from '../components/Cart/ContactForm';
import EmptyCart from '../components/Cart/EmptyCart';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartCount } = useCart();
  const [farmInfo, setFarmInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadFarmData = async () => {
      if (cartItems.length === 0) {
        setFarmInfo(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const firstFarmId = cartItems[0].farmer;
        if (firstFarmId) {
          const farmRes = await apiClient.get(API_ENDPOINTS.farms.byId(firstFarmId));
          setFarmInfo(farmRes.data);
        }
      } catch (err) {
        console.error("Error loading farm info:", err);
        setError("Could not load farm data.");
        toast.error("Could not load farm data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFarmData();
  }, [cartItems]); // Re-run only when cartItems change

  const totalDue = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (user) {
      toast.error("Farmers cannot place orders.", { autoClose: 4000 });
      return;
    }

    if (!farmInfo?._id) {
      toast.error("Cart error: Farm information is missing.");
      return;
    }

    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in your contact information.");
      return;
    }

    setIsSubmitting(true);
    const sanitizedName = sanitizeName(fullName);
    const cleanedPhone = sanitizePhone(phoneNumber);

    const orderData = {
      farmerId: farmInfo._id,
      customerName: sanitizedName,
      customerPhone: cleanedPhone,
      orderItems: cartItems.map(item => ({
        productId: item._id, name: item.name, quantity: item.quantity, unitPrice: item.price,
      })),
    };

    try {
      await submitOrder(orderData);
      toast.success('Order placed successfully! The farm will contact you shortly.', { autoClose: 5000 });
      clearCart();
      setFullName('');
      setPhoneNumber('');
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage, { autoClose: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && cartItems.length > 0) {
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
            <ContactForm
              fullName={fullName}
              setFullName={setFullName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onSubmit={handleSubmitOrder}
              loading={isSubmitting}
              disabled={!!user}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;