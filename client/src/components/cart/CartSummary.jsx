
import { Plus, Minus, Trash2 } from 'lucide-react'; 

function CartItem({ item, onQuantityChange, onRemoveItem }) {
  
  // Ensures the input isn't left empty
  const handleBlur = (e) => {
    if (e.target.value === "") {
      onQuantityChange(item.id, "1"); 
    }
  };

  return (
    <li className="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center py-4">
      
      <div className="flex items-center gap-3">
        <div>
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <span className="text-gray-400 text-sm">
            ${item.price.toFixed(2)} / {item.unit}
          </span>
        </div>
      </div>
      
      <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-2 sm:gap-4 mt-3 sm:mt-0">
        
        <div className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1">
          {/* 2. MODIFICATION: "-" button uses the new function */}
          <button 
            onClick={() => onQuantityChange(item.id, (item.qty || 0) - 1)}
            className="text-gray-600 hover:text-red-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={item.qty === 1 || item.qty === ""}
          >
            <Minus size={16} />
          </button>
          
          <input 
            type="number"
            value={item.qty}
            onChange={(e) => onQuantityChange(item.id, e.target.value)}
            onBlur={handleBlur} // To ensure value is not empty
            min="1"
            max={item.stock}
            className="font-semibold text-gray-800 w-10 text-center [appearance:textfield] focus:outline-none" // [appearance:textfield] hides arrows
          />
          
          <button 
            onClick={() => onQuantityChange(item.id, (item.qty || 0) + 1)}
            className="text-gray-600 hover:text-emerald-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={item.qty >= item.stock}
          >
            <Plus size={16} />
          </button>
        </div>

        <span className="font-semibold text-gray-900 w-14 sm:w-16 text-right">
          ${(item.qty * item.price || 0).toFixed(2)}
        </span>

        <button 
          onClick={() => onRemoveItem(item.id)} 
          className="text-gray-400 hover:text-red-500 transition"
          title="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
}

export default function CartSummary({ items, total, itemCount, onQuantityChange, onRemoveItem, onClearAll }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Order Summary</h2>
        <span className="text-emerald-600 bg-emerald-100 font-medium text-sm px-3 py-1 rounded-full">
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>
      
      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {items.map(item => (
              <CartItem 
                key={item.id} 
                item={item} 
                onQuantityChange={onQuantityChange} // 7. Passing the new function
                onRemoveItem={onRemoveItem}
              />
            ))}
          </ul>
      
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-4 border-t border-gray-300 gap-4">
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 transition"
            >
              <Trash2 size={16} />
              Clear All Items
            </button>
            <div className="flex w-full sm:w-auto justify-between sm:items-center gap-4">
              <span className="text-lg font-bold text-gray-900 uppercase">
                Total
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}