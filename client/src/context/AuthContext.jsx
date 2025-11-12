import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

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
  const [avatarUrl, setAvatarUrl] = useState("");

  // Function to update avatar (no change, this is still valid)
  const updateAvatar = (newAvatarUrl) => {
    const url = newAvatarUrl || "";
    setAvatarUrl(url);
    localStorage.setItem("avatarUrl", url);
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const token = authService.getAuthToken();

    if (currentUser && token) {
      setUser(currentUser); // User object now contains 'role'
      // Load avatar from storage
      const storedAvatar = localStorage.getItem("avatarUrl");
      if (storedAvatar) {
        setAvatarUrl(storedAvatar);
      }
    } else if (currentUser || token) {
      // Clean up if data is partial/corrupt
      authService.clearAuthData();
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // This effect handles cross-tab state synchronization
    const handleStorageChange = (e) => {
      // On logout in another tab
      if ((e.key === "user" || e.key === "token") && !e.newValue) {
        authService.clearAuthData();
        setUser(null);
        setAvatarUrl("");
      }
      // Sync avatar changes from other tabs
      if (e.key === "avatarUrl") {
        setAvatarUrl(e.newValue || "");
      }
    };

    // This interval handles manual deletion of localStorage
    const intervalId = setInterval(() => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getAuthToken();

      if (user && (!currentUser || !token)) {
        // User state exists but token/user in storage was manually deleted
        authService.clearAuthData();
        setUser(null);
        setAvatarUrl("");
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
      setUser(result.user);
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
    setAvatarUrl("");
    localStorage.removeItem("avatarUrl");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    avatarUrl,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;
