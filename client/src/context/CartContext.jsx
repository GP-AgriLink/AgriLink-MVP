
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

// 1. Create the Context
const CartContext = createContext();

// 2. Create the Provider (the "Store" component)
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [farmData, setFarmData] = useState(null); 
  // 3. Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    const storedFarm = localStorage.getItem('cartFarm');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    if (storedFarm) {
      setFarmData(JSON.parse(storedFarm));
    }
  }, []);

  // 4. Helper function to save to state and localStorage
  const updateCartState = (newCart, newFarm) => {
    if (newFarm) {
      setFarmData(newFarm);
      localStorage.setItem('cartFarm', JSON.stringify(newFarm));
    } else if (newCart.length === 0) {
      // Clear farm if cart is empty
      setFarmData(null);
      localStorage.removeItem('cartFarm');
    }

    // Update Items
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));

    // Fire the event for the Navbar
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // 5. Add to Cart Logic
  const addToCart = (product, farm) => {
    if (farmData && farmData._id !== farm._id) {
      toast.error("You can only order from one farm at a time. Clear your cart to switch farms.");
      return;
    }

    if (!farmData) {
      setFarmData(farm);
    }
    
    let newCart;
    const existingItemIndex = cartItems.findIndex(item => item.id === product._id);

    if (existingItemIndex !== -1) {
      // Item already in cart
      toast.info(`${product.name} is already in your cart. You can change the quantity there.`);
      return; 
    } else {
      // Add new item
      const newItem = {
        id: product._id,
        name: product.name,
        qty: 1, 
        unit: product.unit,
        price: product.price,
        stock: product.stock,
      };
      newCart = [...cartItems, newItem];
    }
    
    updateCartState(newCart, farm);
    toast.success(`${product.name} added to cart!`);
  };

  // 6. Quantity, Remove, and Clear logic (moved from CartPage)
  const updateQuantity = (itemId, newQtyString) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    if (newQtyString === "") {
      const newCart = cartItems.map(i => i.id === itemId ? { ...i, qty: "" } : i);
      updateCartState(newCart, farmData);
      return;
    }

    let newQty = parseInt(newQtyString, 10);
    if (isNaN(newQty)) return;
    if (newQty < 1) newQty = 1;

    if (newQty > item.stock) {
      toast.warn(`Stock limit for ${item.name} is ${item.stock}.`);
      newQty = item.stock;
    }

    const newCart = cartItems.map(i => i.id === itemId ? { ...i, qty: newQty } : i);
    updateCartState(newCart, farmData);
  };

  const removeFromCart = (itemId) => {
    const newCart = cartItems.filter(item => item.id !== itemId);
    updateCartState(newCart, farmData);
  };

  const clearCart = () => {
    updateCartState([], null);
  };

  // 7. Calculate totals (Memoized)
  const itemCount = cartItems.length;
  const totalDue = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * (item.qty || 0)), 0);
  }, [cartItems]);

  // 8. Provide all values to children
  const value = {
    cartItems,
    farmData,
    itemCount,
    totalDue,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    updateCartState 
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  return useContext(CartContext);
};