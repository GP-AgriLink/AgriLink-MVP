
import { useState, useEffect, useMemo } from 'react';
import CartBanner from '../components/cart/CartBanner';
import CartSummary from '../components/cart/CartSummary';
import CartCheckoutBox from '../components/cart/CartCheckoutBox';

// Mock data (if localStorage is empty)
const MOCK_CART_DATA = [
  { id: 1, name: 'Pressed Apple Cider', qty: 1, unit: '64OZ', price: 11.00 },
  { id: 2, name: 'Peach Preserves', qty: 1, unit: 'JAR', price: 8.50 },
  { id: 3, name: 'Honeycrisp Apples', qty: 1, unit: 'LB', price: 3.99 },
];

const MOCK_FARM_DATA = {
  name: "Agrilink Corp"
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [farmData, setFarmData] = useState({});

  // 1. Fetch data from localStorage on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const items = storedCart ? JSON.parse(storedCart) : MOCK_CART_DATA;
    setCartItems(items);
    
    setFarmData(MOCK_FARM_DATA);

    // If localStorage was empty, populate it with mock data
    if (!storedCart) {
      localStorage.setItem("cart", JSON.stringify(MOCK_CART_DATA));
    }
  }, []);

  // 2. Helper function to update both state and localStorage
  const updateCart = (newCartItems) => {
    setCartItems(newCartItems);
    localStorage.setItem("cart", JSON.stringify(newCartItems));
  };

  // 3. Calculate total price and total item count
  // useMemo ensures this only recalculates when cartItems changes
  const [totalDue, totalItems] = useMemo(() => {
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const count = cartItems.reduce((acc, item) => acc + item.qty, 0);
    return [total, count];
  }, [cartItems]);

  // 4. Cart handler functions (passed down to CartSummary)
  
  const handleIncreaseQty = (itemId) => {
    const newCartItems = cartItems.map(item => 
      item.id === itemId ? { ...item, qty: item.qty + 1 } : item
    );
    updateCart(newCartItems);
  };

  const handleDecreaseQty = (itemId) => {
    const itemToDecrease = cartItems.find(item => item.id === itemId);

    let newCartItems;
    if (itemToDecrease.qty > 1) {
      newCartItems = cartItems.map(item => 
        item.id === itemId ? { ...item, qty: item.qty - 1 } : item
      );
    } else {
      // Remove the item from the cart
      newCartItems = cartItems.filter(item => item.id !== itemId);
    }
    updateCart(newCartItems);
  };

  const handleClearCart = () => {
    updateCart([]);
  };

  return (
    <div className="min-h-screen bg-emerald-50/50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <CartBanner 
          totalDue={totalDue} 
          farmName={farmData.name} 
        />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <CartSummary 
              items={cartItems} 
              total={totalDue}
              itemCount={totalItems}
              onIncrease={handleIncreaseQty}
              onDecrease={handleDecreaseQty}
              onClearAll={handleClearCart}
            />
          </div>
          
          <div className="lg:col-span-1 h-fit">
            <CartCheckoutBox total={totalDue} />
          </div>
        </div>
      </div>
    </div>
  );
}
