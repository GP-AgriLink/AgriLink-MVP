import React from "react";
import AddToCart from './AddToCart.jsx';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

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

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div
      className="
        bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col
        border border-[#84dcc6] transition-all duration-300 ease-in-out
        hover:shadow-2xl
      "
    >
      {/* --- IMAGE --- */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
          src={imageUrl}
          alt={name}
        />
        {tag && (
          <span className="absolute top-4 left-4 bg-[#2a9d8f] text-white text-xs font-semibold uppercase px-3 py-1.5 rounded-full shadow-md z-10 whitespace-nowrap">
            {tag}
          </span>
        )}
        {stock === 0 ? (
          <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-semibold uppercase px-3 py-1.5 rounded-full shadow-md z-10 whitespace-nowrap">
            Out of Stock
          </span>
        ) : stock < 10 ? (
          <span className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-semibold uppercase px-3 py-1.5 rounded-full shadow-md z-10 whitespace-nowrap">
            Low Stock
          </span>
        ) : null}
      </div>

      {/* --- CONTENT --- */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-[#0a3832] mb-1">{name}</h3>
        <div className="flex flex-row gap-1 mb-3">
          <p className="text-base font-medium text-[#008c7a]">${price}</p>
          <p className="text-base font-medium text-[#5cb39f]">/ {unit}</p>
        </div>
        <p className="text-sm text-gray-500 mb-6 flex-grow">{description}</p>
        <AddToCart onClick={handleAddToCart} disabled={stock === 0} />
      </div>
    </div>
  );
};

export default ProductCard;