import React from 'react';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CartSummary = ({ groupedByFarm, total, itemCount, onQuantityChange, onRemoveItem, onClearAll }) => {
  const farmIds = Object.keys(groupedByFarm);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Your Cart</h2>
          <p className="text-sm text-emerald-800 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} from {farmIds.length} {farmIds.length === 1 ? 'farm' : 'farms'}
          </p>
        </div>
        {itemCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Items Grouped by Farm */}
      <div className="space-y-8">
        {farmIds.map((farmId) => {
          const farmGroup = groupedByFarm[farmId];
          const farm = farmGroup.farm;
          const items = farmGroup.items;
          const farmTotal = farmGroup.total;

          return (
            <div key={farmId} className="border-2 border-emerald-100 rounded-2xl p-5 bg-emerald-50/30">
              {/* Farm Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-emerald-200">
                {farm.avatarUrl && (
                  <img 
                    src={farm.avatarUrl} 
                    alt={farm.farmName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-300"
                  />
                )}
                <div className="flex-1">
                  <Link 
                    to={`/farm/${farmId}`}
                    className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                  >
                    {farm.farmName || 'Unknown Farm'}
                  </Link>
                  <p className="text-sm text-emerald-700 font-semibold">
                    Subtotal: ${farmTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Farm Items */}
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.productId || `cart-item-${index}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-emerald-100"
                  >
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {item.name || 'Unnamed Product'}
                      </p>
                      <p className="text-sm text-emerald-700 mt-1">
                        ${(item.unitPrice || 0).toFixed(2)} / {item.unit || 'unit'}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-emerald-300 rounded-lg bg-white">
                        <button
                          onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-semibold text-gray-900 text-sm min-w-[40px] text-center">
                          {item.quantity || 0}
                        </span>
                        <button
                          onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
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
                          ${((item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total */}
      <div className="border-t-2 border-gray-300 pt-6 mt-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-700 uppercase tracking-wide">
            GRAND TOTAL
          </span>
          <span className="text-2xl font-bold text-gray-900">
            ${(total || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;