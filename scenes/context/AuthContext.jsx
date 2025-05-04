// AuthContext.jsx
import { createContext, useState, useContext } from "react";

export const AuthContext = createContext(); // Named export

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("userRole") || "user");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  const login = (userRole, userId) => {
    setIsAuthenticated(true);
    setRole(userRole);
    setUserId(userId);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userId", userId); // Store userId in localStorage
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole("user");
    setUserId(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { // Named export
  return useContext(AuthContext);
};