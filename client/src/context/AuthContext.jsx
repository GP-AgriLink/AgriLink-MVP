import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";
import { getUserProfile } from "../services/userService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Re-export helper functions from the new authService
export const getAuthToken = authService.getAuthToken;
export const clearAuthData = authService.clearAuthData;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function is called by UserProfileForm.jsx after a successful edit
  const refreshAuthUser = useCallback((updatedUser) => {
    if (updatedUser) {
      // Update the user object in localStorage
      authService.updateUserInStorage(updatedUser);
      // Update the user object in state
      setUser(authService.getCurrentUser());
    }
  }, []);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getAuthToken();

    if (currentUser && token) {
      // 1. Set user immediately from storage for a responsive UI
      setUser(currentUser);

      // 2. Start a background "hydration" process
      const hydrateUser = async () => {
        try {
          // Fetch the full, fresh user object from the server
          const freshUser = await getUserProfile();
          if (freshUser) {
            // Update localStorage with the full user data (e.g., avatarUrl)
            authService.updateUserInStorage(freshUser);
            // Update the state to re-render components (like Navbar)
            setUser(authService.getCurrentUser());
          }
        } catch (error) {
          // Error will be 401 if token is bad, which is handled by the interceptor
          console.error("Failed to hydrate user on load:", error);
        } finally {
          // 3. Set loading to false only after hydration is complete
          setLoading(false);
        }
      };

      hydrateUser();
    } else {
      // No user or token, just stop loading
      authService.clearAuthData();
      setLoading(false);
    }
  }, []); // Run only once on app mount

  useEffect(() => {
    const handleStorageChange = (e) => {
      if ((e.key === "user" || e.key === "token") && !e.newValue) {
        authService.clearAuthData();
        setUser(null);
      }
      if (e.key === "user" && e.newValue) {
        setUser(JSON.parse(e.newValue));
      }
    };

    // This interval handles manual deletion of localStorage
    const intervalId = setInterval(() => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getAuthToken();

      if (user && (!currentUser || !token)) {
        authService.clearAuthData();
        setUser(null);
      }
    }, 1000);

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [user]);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      // Manually hydrate the full user profile immediately after login
      // This ensures avatarUrl is available before navigation completes
      try {
        const freshUser = await getUserProfile();
        authService.updateUserInStorage(freshUser);
        setUser(authService.getCurrentUser());
      } catch (hydrateError) {
        console.error("Failed to hydrate user post-login:", hydrateError);
        setUser(result.user); // Fallback to minimal user from login
      }
    }
    return result;
  };

  const register = async (farmName, email, password, phoneNumber, role) => {
    const result = await authService.register(farmName, email, password, phoneNumber, role);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    refreshAuthUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;
