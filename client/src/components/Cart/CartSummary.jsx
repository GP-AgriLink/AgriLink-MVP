import React from 'react';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CartSummary = ({ items, total, itemCount, onQuantityChange, onRemoveItem, onClearAll }) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Order Summary
          <p className="mt-1 text-sm font-light text-emerald-700">
            Review the product in your basket before confirming delivery.
          </p>
        </h2>

        <span className="text-sm font-bold uppercase tracking-wide text-emerald-700">
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Cart Items */}
      <div className="mb-6 space-y-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4"
          >
            {/* Product Info */}
            <div className="min-w-0 flex-1">
              <Link
                to={`/farm/${item.farmer}`}
                className="block truncate text-base font-semibold text-gray-900 transition-colors hover:text-emerald-600"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-emerald-700">
                ${item.price.toFixed(2)} / {item.unit}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-emerald-300 bg-white">
                <button
                  onClick={() => onQuantityChange(item._id, item.quantity - 1)}
                  className="rounded-l-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                  aria-label="Decrease quantity"
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                <span className="min-w-[40px] px-4 text-center text-sm font-semibold text-gray-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(item._id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="rounded-r-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <FiPlus className="h-4 w-4" />
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
                className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                aria-label="Remove item"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clear All Button - MOVED HERE */}
      {items.length > 0 && (
        <div className="-mt-2 mb-4 flex justify-end">
          <button
            onClick={onClearAll}
            className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold uppercase tracking-wide text-emerald-700">TOTAL</span>
          <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
