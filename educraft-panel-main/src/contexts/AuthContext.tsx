import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔐 Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ✅ Initialize from localStorage immediately (no useEffect delay)
  const storedUser = localStorage.getItem('admin_user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  const [user, setUser] = useState<{ email: string } | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);

  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const userData = { email };
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
