import React from 'react';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CartSummary = ({ items, total, itemCount, onQuantityChange, onRemoveItem, onClearAll }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Your Cart</h2>
          <p className="text-sm text-emerald-800 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100"
          >
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/farm/${item.farmer}`}
                className="text-base font-semibold text-gray-900 hover:text-emerald-600 transition-colors block truncate"
              >
                {item.name}
              </Link>
              <p className="text-sm text-emerald-700 mt-1">
                ${item.price.toFixed(2)} / {item.unit}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-emerald-300 rounded-lg bg-white">
                <button
                  onClick={() => onQuantityChange(item._id, item.quantity - 1)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 transition-colors rounded-l-lg"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="px-4 font-semibold text-gray-900 text-sm min-w-[40px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(item._id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 transition-colors rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              {/* Item Total */}
              <div className="min-w-[80px] text-right">
                <p className="text-base font-bold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemoveItem(item._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Remove item"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-700 uppercase tracking-wide">
            TOTAL
          </span>
          <span className="text-2xl font-bold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
