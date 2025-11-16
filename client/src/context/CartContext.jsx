import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import * as cartApi from "../services/cartApi";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [farmId, setFarmId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); //

  const loadCart = useCallback(async () => {
    if (user && user.role === 'customer') {
      setIsLoading(true);
      try {
        const cart = await cartApi.getCart(); //
        
        const fixedItems = (cart.items || []).map(item => {
          const productData = item.product || {};
          return {
            ...item,
            productId: item.productId || productData._id || item.product,
            unitPrice: item.unitPrice || productData.price,
            name: item.name || productData.name,
            unit: item.unit || productData.unit,
            stock: item.stock || productData.stock,
          };
        });
        
        setCartItems(fixedItems);
        setFarmId(cart.farmId || null);
        
      } catch (error) {
        console.error("Failed to load cart on init:", error);
        setCartItems([]);
        setFarmId(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCartItems([]);
      setFarmId(null);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // (The optimistic functions addToCart, removeFromCart, updateQuantity

  const addToCart = async (product) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    if (user.role === 'farmer') {
      toast.error("Farmers cannot shop.");
      return;
    }

    if (farmId && farmId !== product.farm) { //
      toast.error("You can only order from one farm at a time. Please clear your cart first.");
      return;
    }

    const newQuantity = (cartItems.find(item => item.productId === product._id)?.quantity || 0) + 1;
    const oldCartItems = cartItems;
    try {
      setCartItems(prevItems => {
        const existing = prevItems.find(item => item.productId === product._id);
        if (existing) {
          return prevItems.map(item =>
            item.productId === product._id
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          return [
            ...prevItems,
            {
              productId: product._id,
              name: product.name,
              unitPrice: product.price,
              unit: product.unit,
              stock: product.stock,
              quantity: newQuantity,
              farmId: product.farm, 
            }
          ];
        }
      });
      if (!farmId) setFarmId(product.farm);
      await cartApi.addItemToCart(product._id, newQuantity); //
      toast.success(`${product.name} added to cart!`, { autoClose: 1500 });
    } catch (err) {
      toast.error("Failed to update cart. Please try again.");
      setCartItems(oldCartItems); 
    }
  };

  const removeFromCart = async (productId) => {
    if (!productId) {
      toast.error("Cannot remove item: Invalid ID.");
      return;
    }
    const oldCartItems = cartItems; 
    try {
      const newItems = oldCartItems.filter(item => item.productId !== productId);
      setCartItems(newItems);
      if (newItems.length === 0) setFarmId(null);
      await cartApi.removeItemFromCart(productId); //
      toast.info("Item removed from cart.", { autoClose: 1500 });
    } catch (err) {
      toast.error("Failed to remove item.");
      setCartItems(oldCartItems); 
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!productId) {
      toast.error("Cannot update quantity: Invalid ID.");
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const oldCartItems = cartItems;
    try {
      setCartItems(prevItems => prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
      await cartApi.addItemToCart(productId, newQuantity); //
    } catch (err) {
      toast.error("Failed to update quantity.");
      setCartItems(oldCartItems); 
    }
  };

  // This is the fixed 'clearCart' function
  const clearCart = async () => {
    // 1. Update state immediately
    setCartItems([]);
    setFarmId(null);
    
    try {
      // 2. Call API in background
      await cartApi.clearServerCart(); //
      toast.warn("Cart has been cleared.", { autoClose: 2000 });
    } catch (err) {
      // This toast explains the error in the screenshot
      toast.error("Failed to clear server cart. UI is clear anyway.");
      // --- NO ROLLBACK ---
    }
  };
  
  const totalDue = cartItems.reduce(
    (acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 0),
    0
  );
  
  const cartCount = cartItems.length; // Counts item types, not quantity

  const value = {
    cartItems,
    farmId, 
    isLoading, 
    loadCart, 
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalDue,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};