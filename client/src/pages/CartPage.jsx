// src/pages/CartPage.jsx

import { useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext"; // <-- 1. استدعاء الـ Hook
import CartBanner from "../components/cart/CartBanner";
import CartSummary from "../components/cart/CartSummary";
import ContactForm from "../components/cart/ContactForm";

// --- 2. حذف كل الـ MOCK_DATA والـ MOCK_FARM ---

export default function CartPage() {
  // --- 3. سحب كل البيانات والدوال من المخزن ---
  const {
    cartItems,
    farmData,
    totalDue,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    updateCartState // هنحتاجها عشان نصفر السلة بعد الطلب
  } = useCart();
  
  // --- 4. حذف كل الـ state والـ useEffects القديمة ---
  // (useState, useEffect, updateCart, totalDue, handle..., etc. -> ALL REMOVED)
  
  // (بنحتفظ بالـ state بتاع الفورم والـ loading بس)
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderItems = cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      quantity: item.qty || 1,
      unitPrice: item.price,
    }));

    const orderData = {
      farmerId: farmData._id, // (هييجي من المخزن)
      customerName: fullName,
      customerPhone: phoneNumber,
      orderItems: orderItems,
    };

    try {
      await axios.post("/api/orders", orderData);
      alert("Order Confirmed!");
      // --- 5. تعديل: بنستخدم دوال المخزن ---
      updateCartState([], null); // (تصفير السلة والمزرعة)
      setFullName(""); // (تصفير الفورم)
      setPhoneNumber(""); // (تصفير الفورم)

    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/50 py-6 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 6. بنبعت البيانات من المخزن */}
        <CartBanner 
          totalDue={totalDue} 
          farmName={farmData?.name} // (بنستخدم ? عشان لو المزرعة فاضية)
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <CartSummary
              items={cartItems}
              total={totalDue}
              itemCount={itemCount} // (جاي من المخزن)
              onQuantityChange={updateQuantity} // (جاي من المخزن)
              onRemoveItem={removeFromCart} // (جاي من المخزن)
              onClearAll={clearCart} // (جاي من المخزن)
            />
          </div>

          <div className="lg:col-span-1 h-fit bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <ContactForm
              fullName={fullName}
              setFullName={setFullName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onSubmit={handleSubmitOrder}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}