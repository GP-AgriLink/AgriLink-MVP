import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken, clearAuthData } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = getAuthToken();

  // Monitor for manual deletion of auth data
  useEffect(() => {
    if (user) {
      const checkAuthData = () => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        // If user state exists but localStorage is cleared, redirect to login
        if (!savedUser || !savedToken) {
          clearAuthData();
          window.location.href = '/login';
        }
      };

      // Check immediately
      checkAuthData();
      
      // Then check periodically
      const intervalId = setInterval(checkAuthData, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // If no user or no token, clear any stale data and redirect to login
  if (!user || !token) {
    clearAuthData();
    return <Navigate to="/login" replace />;
  }

  // Render the protected content if user is authenticated
  return children;
};

export default ProtectedRoute;
