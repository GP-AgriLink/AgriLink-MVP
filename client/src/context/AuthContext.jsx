import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { getIncomingOrdersCount } from '../services/orderApi'; // Import the API function

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getAuthToken = authService.getAuthToken;
export const clearAuthData = authService.clearAuthData;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Add order count state to the context
  const [incomingOrdersCount, setIncomingOrdersCount] = useState(0);
  // Add avatar state to the context
  const [avatarUrl, setAvatarUrl] = useState('');

  // Create a reusable function to fetch and set the count
  const fetchAndSetOrderCount = async () => {
    try {
      const count = await getIncomingOrdersCount();
      setIncomingOrdersCount(count);
      localStorage.setItem('incomingOrdersCount', count.toString());
    } catch (error) {
      console.error("Failed to fetch order count:", error);
      setIncomingOrdersCount(0); // Reset on error
      localStorage.setItem('incomingOrdersCount', '0');
    }
  };

  // Function to update avatar
  const updateAvatar = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
    localStorage.setItem('avatarUrl', newAvatarUrl);
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getAuthToken();

    if (currentUser && token) {
      setUser(currentUser);
      // Load count immediately from storage for quick UI
      const storedCount = localStorage.getItem('incomingOrdersCount');
      if (storedCount) {
        setIncomingOrdersCount(parseInt(storedCount, 10));
      }
      // Load avatar from storage
      const storedAvatar = localStorage.getItem('avatarUrl');
      if (storedAvatar) {
        setAvatarUrl(storedAvatar);
      }
      // Fetch a fresh count on initial load
      fetchAndSetOrderCount();
    } else if (currentUser || token) {
      authService.clearAuthData();
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if ((e.key === 'user' || e.key === 'token') && !e.newValue) {
        authService.clearAuthData();
        setUser(null);
        setIncomingOrdersCount(0); // Reset count on logout
        setAvatarUrl(''); // Reset avatar on logout
      }
      // Also sync count changes from other tabs
      if (e.key === 'incomingOrdersCount' && e.newValue) {
        setIncomingOrdersCount(parseInt(e.newValue, 10));
      }
      // Sync avatar changes from other tabs
      if (e.key === 'avatarUrl' && e.newValue) {
        setAvatarUrl(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(() => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getAuthToken();

      if (user && (!currentUser || !token)) {
        authService.clearAuthData();
        setUser(null);
        setIncomingOrdersCount(0); // Reset count on manual clear
        setAvatarUrl(''); // Reset avatar on manual clear
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [user]);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      fetchAndSetOrderCount(); // Fetch count on login
    }
    return result;
  };

  const register = async (farmName, email, password, phoneNumber) => {
    const result = await authService.register(farmName, email, password, phoneNumber);
    if (result.success) {
      setUser(result.user);
      setIncomingOrdersCount(0); // New user has 0 orders
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIncomingOrdersCount(0); // Reset count on logout
    setAvatarUrl(''); // Reset avatar on logout
    localStorage.removeItem('avatarUrl');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    incomingOrdersCount, // Pass state
    fetchAndSetOrderCount, // Pass updater function
    avatarUrl, // Pass avatar state
    updateAvatar, // Pass avatar updater function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;