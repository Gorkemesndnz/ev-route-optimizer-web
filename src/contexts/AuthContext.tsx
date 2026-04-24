import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMessage: string;
  setAuthMessage: (msg: string) => void;
  requireAuth: (message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('iyontree_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      // Bozuk localStorage verisi — temizle ve null dön
      localStorage.removeItem('iyontree_user');
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  const setCurrentUser = (user: User | null) => {
    if (user) {
      localStorage.setItem('iyontree_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('iyontree_user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    setCurrentUserState(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  useEffect(() => {
    const handleAuthLogout = () => setCurrentUser(null);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const requireAuth = (message?: string) => {
    setAuthMessage(message || '');
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      currentUser, setCurrentUser, logout,
      isAuthModalOpen, setIsAuthModalOpen,
      authMessage, setAuthMessage,
      requireAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
