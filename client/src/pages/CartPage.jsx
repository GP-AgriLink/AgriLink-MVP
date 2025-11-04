import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../config/api';
import { useAuth } from '../context/AuthContext';
import { submitOrder } from '../services/cartApi';
import { sanitizeName, sanitizePhone } from '../utils/sanitizers';

import CartBanner from '../components/Cart/CartBanner';
import CartSummary from '../components/Cart/CartSummary';
import ContactForm from '../components/Cart/ContactForm';
import EmptyCart from '../components/Cart/EmptyCart';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [farmInfo, setFarmInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadCartData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const itemsFromStorage = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        console.log('📦 Cart items loaded from localStorage:', itemsFromStorage);

        if (itemsFromStorage.length === 0) {
          setCartItems([]);
          setFarmInfo(null);
          setIsLoading(false);
          return;
        }

        // Enforce "single farm" rule from SRS 
        const firstFarmId = itemsFromStorage[0].farmer;
        
        // Validate that farmer ID exists
        if (!firstFarmId) {
          console.error('❌ Cart item missing farmer ID:', itemsFromStorage[0]);
          toast.error('Cart data is corrupted. Please clear your cart and try again.');
          setError("Cart data is corrupted.");
          return;
        }
        
        const validItems = itemsFromStorage.filter(item => item.farmer === firstFarmId);

        if (validItems.length < itemsFromStorage.length) {
          toast.warn('Some items were removed. You can only order from one farm at a time.', {
            autoClose: 3000,
          });
        }

        setCartItems(validItems);
        localStorage.setItem('cartItems', JSON.stringify(validItems));

        // Fetch farm details for display
        if (validItems.length > 0) {
          console.log('🚜 Fetching farm info for ID:', firstFarmId);
          const farmRes = await apiClient.get(`/api/farms/${firstFarmId}`);
          console.log('🚜 Farm info loaded:', farmRes.data);
          setFarmInfo(farmRes.data);
        } else {
          setFarmInfo(null);
        }

      } catch (err) {
        console.error("Error loading cart:", err);
        setError("Could not load cart data. Please try again.");
        toast.error("Could not load cart data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCartData();
  }, []);

  const updateCartInStorage = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
    if (newCart.length === 0) {
      setFarmInfo(null);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    const newCart = cartItems.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCartInStorage(newCart);
  };

  const handleRemoveItem = (productId) => {
    const newCart = cartItems.filter(item => item._id !== productId);
    updateCartInStorage(newCart);
    toast.info('Item removed from cart');
  };

  const handleClearCart = () => {
    updateCartInStorage([]);
    toast.info('Cart cleared');
  };

  const totalDue = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.length;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (user) {
      toast.error("Farmers cannot place orders. Please log out to continue as a customer.");
      return;
    }

    if (!farmInfo?._id) {
      toast.error("Cart error: Farm information is missing.");
      return;
    }

    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Sanitize and clean inputs
    const sanitizedName = sanitizeName(fullName);
    const cleanedPhone = sanitizePhone(phoneNumber);

    // Validate cart items have all required fields
    const invalidItems = cartItems.filter(item => 
      !item._id || !item.name || !item.quantity || !item.price
    );
    
    if (invalidItems.length > 0) {
      console.error('❌ Invalid cart items found:', invalidItems);
      toast.error('Some cart items are missing required information. Please clear your cart and add items again.');
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      farmerId: farmInfo._id,
      customerName: sanitizedName,
      customerPhone: cleanedPhone,
      orderItems: cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    };

    console.log('📤 Submitting order with data:', JSON.stringify(orderData, null, 2));
    console.log('🚜 Farm info:', farmInfo);
    console.log('🛒 Cart items:', cartItems);

    try {
      await submitOrder(orderData);
      toast.success('Order placed successfully! The farm will contact you shortly.', {
        autoClose: 4000
      });
      updateCartInStorage([]);
      setFullName('');
      setPhoneNumber('');
      navigate('/');
    } catch (err) {
      console.error('Order submission error:', err);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
        toast.error(`Validation error: ${errorMessages}`);
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to place order. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-emerald-50/50 py-6 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Cart Banner */}
        <CartBanner
          totalDue={totalDue}
          farmName={farmInfo?.farmName}
        />

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Side: Cart Summary */}
          <div className="lg:col-span-2">
            <CartSummary
              items={cartItems}
              total={totalDue}
              itemCount={itemCount}
              onQuantityChange={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearAll={handleClearCart}
            />
          </div>

          {/* Right Side: Contact Form */}
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