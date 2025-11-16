import apiClient, { API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';

/**
 * Fetches the user's current cart from the server.
 * @returns {Promise<object>} The user's cart object (with populated farm data)
 */
export const getCart = async () => {
  try {
    const { data } = await apiClient.get(API_ENDPOINTS.cart.getCart);
    return data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Adds an item to the cart or updates its quantity.
 * Backend automatically finds the product's farm.
 * @param {string} productId - The ID of the product to add
 * @param {number} quantity - The new total quantity
 * @returns {Promise<object>} The updated cart object
 */
export const addItemToCart = async (productId, quantity) => {
  try {
    const { data } = await apiClient.post(API_ENDPOINTS.cart.addItem, {
      productId,
      quantity,
    });
    return data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    toast.error(error.response?.data?.message || 'Failed to add item.');
    throw error;
  }
};

/**
 * Removes an item completely from the cart.
 * @param {string} productId - The ID of the product to remove
 * @returns {Promise<object>} The updated cart object
 */
export const removeItemFromCart = async (productId) => {
  try {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.cart.removeItem(productId)
    );
    return data;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    toast.error(error.response?.data?.message || 'Failed to remove item.');
    throw error;
  }
};

/**
 * Clears all items from the user's cart.
 * @returns {Promise<object>} An empty cart object
 */
export const clearServerCart = async () => {
  try {
    const { data } = await apiClient.delete(API_ENDPOINTS.cart.clearCart);
    return data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Creates order(s) from the user's cart.
 * Returns an ARRAY of orders (one per farm).
 * @returns {Promise<Array>} Array of created order objects
 */
export const createOrder = async () => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.orders.create, {});
    
    return response.data;
  } catch (error) {
    console.error('Error submitting order:', error);
    console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};