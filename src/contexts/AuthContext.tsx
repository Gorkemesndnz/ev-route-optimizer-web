import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMessage: string;
  setAuthMessage: (msg: string) => void;
  requireAuth: (message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<any>(() => {
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

  const setCurrentUser = (user: any) => {
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
