import React, { createContext, useContext, ReactNode } from 'react';

// Mock Auth Context
interface AuthContextType {
  user: { email: string; id: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mockUser = { email: 'demo@virtualpo.com', id: 'demo-user' };
  
  const value: AuthContextType = {
    user: mockUser,
    loading: false,
    signIn: async () => {},
    signOut: async () => {}
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock Role Context
interface RoleContextType {
  role: string;
  currentRole: string;
  setRole: (role: string) => void;
  getActionLabel: (action: string) => string;
  getQuickActions: () => string[];
  applyTerminology: (term: string) => string;
  getRoleSpecificTemplates: () => any[];
  shouldShowModule: (module: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};

export const MockRoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: RoleContextType = {
    role: 'product-owner',
    currentRole: 'product-owner',
    setRole: () => {},
    getActionLabel: (action: string) => {
      const labels: Record<string, string> = {
        'create_priority': 'Create Priority',
        'create_stakeholder': 'Add Stakeholder',
        'create_meeting': 'Schedule Meeting'
      };
      return labels[action] || action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    getQuickActions: () => ['Create Priority', 'Add Stakeholder', 'Schedule Meeting'],
    applyTerminology: (term: string) => term,
    getRoleSpecificTemplates: () => [],
    shouldShowModule: () => true
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

// Combined Mock Provider
export const MockProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MockAuthProvider>
      <MockRoleProvider>
        {children}
      </MockRoleProvider>
    </MockAuthProvider>
  );
};