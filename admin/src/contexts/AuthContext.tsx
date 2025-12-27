import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔐 Hardcoded credentials
const CREDENTIALS = {
  PRIVATE: { email: 'admin@example.com', password: 'admin123', role: 'private' },
  PUBLIC: { email: 'public@example.com', password: 'public', role: 'public' }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ✅ Initialize from localStorage immediately
  const storedUser = localStorage.getItem('admin_user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  const [user, setUser] = useState<{ email: string; role: string } | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);

  const login = (email: string, password: string): boolean => {
    // Check Private Admin
    if (email === CREDENTIALS.PRIVATE.email && password === CREDENTIALS.PRIVATE.password) {
      const userData = { email, role: CREDENTIALS.PRIVATE.role };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return true;
    }
    // Check Public User
    if (email === CREDENTIALS.PUBLIC.email && password === CREDENTIALS.PUBLIC.password) {
      const userData = { email, role: CREDENTIALS.PUBLIC.role };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_user');
    window.location.reload(); // Force reload to clear API interceptors if any
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
