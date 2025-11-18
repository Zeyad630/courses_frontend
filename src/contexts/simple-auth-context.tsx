import type { User, UserRole, AuthState } from 'src/types/user';

import { useMemo, useEffect, useContext, useReducer, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
};

// ----------------------------------------------------------------------

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  try {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        user,
        isAuthenticated: true,
        isLoading: false,
      };
    }
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error);
  }
  
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

// ----------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, getInitialState());

  // Persist user to localStorage when state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('auth_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [state.user]);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validCredentials = [
        { email: 'admin@school.com', password: 'admin123', role: 'admin' as UserRole, name: 'Admin User' },
        { email: 'instructor@school.com', password: 'instructor123', role: 'instructor' as UserRole, name: 'Instructor User' },
        { email: 'student@school.com', password: 'student123', role: 'student' as UserRole, name: 'Student User' },
        { email: 'hello@gmail.com', password: '@demo1234', role: 'admin' as UserRole, name: 'Admin User' },
      ];

      const user = validCredentials.find(cred => cred.email === email && cred.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const mockUser: User = {
        id: user.role === 'admin' ? '1' : user.role === 'instructor' ? '2' : '3',
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'LOGIN', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => dispatch({ type: 'UPDATE_USER', payload: updates }), []);

  const hasRole = useCallback((role: UserRole) => state.user?.role === role, [state.user?.role]);

  const hasAnyRole = useCallback((roles: UserRole[]) => state.user ? roles.includes(state.user.role) : false, [state.user]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      updateUser,
      hasRole,
      hasAnyRole,
    }),
    [state, login, logout, updateUser, hasRole, hasAnyRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
