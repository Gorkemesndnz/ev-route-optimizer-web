import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMessage: string;
  setAuthMessage: (msg: string) => void;
  requireAuth: (message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  const requireAuth = (message?: string) => {
    setAuthMessage(message || '');
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      currentUser, setCurrentUser,
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
