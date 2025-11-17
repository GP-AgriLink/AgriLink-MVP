import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import * as cartApi from "../services/cartApi";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadCart = useCallback(async () => {
    if (user && user.role === 'customer') {
      setIsLoading(true);
      try {
        const cart = await cartApi.getCart();
        
        const fixedItems = (cart.items || []).map(item => {
          const productData = item.product || {};
          const farmData = item.farm || {};
          
          return {
            ...item,
            productId: item.product?._id || productData._id || item.product,
            unitPrice: item.price || item.unitPrice || productData.price,
            name: item.name || productData.name,
            unit: item.unit || productData.unit,
            stock: item.stock || productData.stock,
            quantity: item.quantity || 1,
            // Keep the farm object for grouping
            farm: {
              _id: farmData._id,
              farmName: farmData.farmName,
              avatarUrl: farmData.avatarUrl
            }
          };
        });
        
        setCartItems(fixedItems);
        
      } catch (error) {
        console.error("Failed to load cart on init:", error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCartItems([]);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (product) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    if (user.role === 'farmer') {
      toast.error("Farmers cannot shop.");
      return;
    }

    // Users can now add items from multiple farms

    const newQuantity = (cartItems.find(item => item.productId === product._id)?.quantity || 0) + 1;
    const oldCartItems = cartItems;
    
    try {
      // Optimistically update UI
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
              farm: product.farmData || { _id: product.farm } 
            }
          ];
        }
      });
      
      await cartApi.addItemToCart(product._id, newQuantity);
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
      
      await cartApi.removeItemFromCart(productId);
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
      await cartApi.addItemToCart(productId, newQuantity);
    } catch (err) {
      toast.error("Failed to update quantity.");
      setCartItems(oldCartItems);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    
    try {
      await cartApi.clearServerCart();
      toast.warn("Cart has been cleared.", { autoClose: 2000 });
    } catch (err) {
      toast.error("Failed to clear server cart. UI is clear anyway.");
    }
  };
  
  const totalDue = cartItems.reduce(
    (acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 0),
    0
  );
  
  const cartCount = cartItems.length;

  // Group items by farm for UI
  const groupedByFarm = cartItems.reduce((acc, item) => {
    const farmId = item.farm?._id;
    if (!farmId) return acc;
    
    if (!acc[farmId]) {
      acc[farmId] = {
        farm: item.farm,
        items: [],
        total: 0
      };
    }
    
    acc[farmId].items.push(item);
    acc[farmId].total += (item.unitPrice || 0) * (item.quantity || 0);
    
    return acc;
  }, {});

  const value = {
    cartItems,
    isLoading,
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalDue,
    groupedByFarm,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};