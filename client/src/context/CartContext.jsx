import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import apiClient, { API_ENDPOINTS } from "../config/api.js";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart from localStorage on initial render
    try {
      const itemsFromStorage = JSON.parse(localStorage.getItem("cartItems")) || [];
      setCartItems(itemsFromStorage);
    } catch (error) {
      console.error("Failed to parse cart items from localStorage", error);
      setCartItems([]);
    }
  }, []);

  // Function to update both state and localStorage
  const updateCart = (newCart) => {
    // Enforce single-farm rule
    if (newCart.length > 1) {
      const firstFarmId = newCart[0].farmer;
      const allFromSameFarm = newCart.every((item) => item.farmer === firstFarmId);
      if (!allFromSameFarm) {
        toast.error("You can only order from one farm at a time.", { autoClose: 3000 });
        // Find the first item from a different farm and reject the update
        return;
      }
    }
    setCartItems(newCart);
    localStorage.setItem("cartItems", JSON.stringify(newCart));
  };

  const addToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const res = await apiClient.get(API_ENDPOINTS.cart.getCart, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const backendCart = res.data.items;

      const existingItem = backendCart.find((item) => item.product._id === product._id);
      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

      const addRes = await apiClient.post(
        API_ENDPOINTS.cart.addItem,
        { productId: product._id, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const localExisting = cartItems.find((item) => item._id === product._id);
      let newCart;
      if (localExisting) {
        newCart = cartItems.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...cartItems, { ...product, quantity: 1 }];
      }
      updateCart(newCart);

      toast.success(`${product.name} added to cart!`, { autoClose: 1500 });
    } catch (err) {
      toast.error("Failed to add product. Try again.", { autoClose: 2000 });
    }
  };

  const removeFromCart = (productId) => {
    const newCart = cartItems.filter((item) => item._id !== productId);
    updateCart(newCart);
    toast.info("Item removed from cart.", { autoClose: 1500 });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const newCart = cartItems.map((item) =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(newCart);
  };

  const clearCart = () => {
    updateCart([]);
    toast.warn("Cart has been cleared.", { autoClose: 2000 });
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount: cartItems.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
