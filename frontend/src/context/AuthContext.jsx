import { createContext, useEffect, useState } from "react";
import { getCurrentUser } from "../api/user.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const refreshUser = async () => {
    try {
      setLoadingUser(true);
      const res = await getCurrentUser();
      setUser(res.data);
    } catch (err) {
      console.error("❌ Failed to load user", err);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [isAuthenticated]);

  const login = (token) => {
    localStorage.setItem("access_token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loadingUser,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
