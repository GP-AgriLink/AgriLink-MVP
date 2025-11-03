// src/components/FarmStore/ProductCard.jsx

import React from "react";
import AddToCart from "./AddToCart.jsx";
import {toast} from "react-toastify";
import { useCart } from "../../context/CartContext"; // <-- 1. استدعاء الـ Hook

const ProductCard = ({product, farm}) => { // <-- 2. استلام بيانات المزرعة
  const {
    _id,
    name = "Unnamed Product",
    price = 0,
    description = "No description available.",
    imageUrl = "https://via.placeholder.com/400x300?text=No+Image",
    unit = "",
    tag,
    stock = 0,
  } = product;

  // --- 3. تعديل اللوجيك بالكامل ---
  const { addToCart } = useCart(); // 4. سحب الدالة من المخزن

  const handleAddToCartClick = () => {
    if (stock === 0) {
      toast.error("This product is out of stock", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    // 5. استدعاء الدالة من المخزن
    addToCart(product, farm); 
  };
  // --- نهاية التعديل ---

  return (
    <div
      className="
        bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col
        border border-[#84dcc6] transition-all duration-300 ease-in-out
        hover:shadow-2xl
      "
    >
      {/* ... (باقي كود الـ JSX زي ما هو) ... */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-[#0a3832] mb-1">{name}</h3>
        <div className="flex flex-row gap-1 mb-3">
          <p className="text-base font-medium text-[#008c7a]">${price}</p>
          <p className="text-base font-medium text-[#5cb39f]">/ {unit}</p>
        </div>
        <p className="text-sm text-gray-500 mb-6 flex-grow">{description}</p>

        {/* --- 6. تعديل الزرار --- */}
        <AddToCart onClick={handleAddToCartClick} disabled={stock === 0} />
      </div>
    </div>
  );
};

export default ProductCard;