import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart from localStorage on initial render
    try {
      const itemsFromStorage = JSON.parse(localStorage.getItem('cartItems')) || [];
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
      const allFromSameFarm = newCart.every(item => item.farmer === firstFarmId);
      if (!allFromSameFarm) {
        toast.error("You can only order from one farm at a time.", { autoClose: 3000 });
        // Find the first item from a different farm and reject the update
        return;
      }
    }
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item._id === product._id);
    let newCart;
    if (existingItem) {
      newCart = cartItems.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      const cartItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        imageUrl: product.imageUrl,
        stock: product.stock,
        farmer: typeof product.farmer === 'object' ? product.farmer._id : product.farmer,
        quantity: 1
      };
      newCart = [...cartItems, cartItem];
    }
    updateCart(newCart);
    toast.success(`${product.name} added to cart!`, { autoClose: 1500 }); // Dynamic timing
  };

  const removeFromCart = (productId) => {
    const newCart = cartItems.filter(item => item._id !== productId);
    updateCart(newCart);
    toast.info("Item removed from cart.", { autoClose: 1500 });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const newCart = cartItems.map(item =>
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

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};