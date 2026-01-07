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
  register: (params: { email: string; name: string; password: string }) => Promise<void>;
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

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

const USERS_STORAGE_KEY = 'auth_users';

const getStoredUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUser[];
  } catch {
    return [];
  }
};

const setStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const buildUserFromStored = (stored: StoredUser): User => ({
  id: stored.id,
  name: stored.name,
  email: stored.email,
  role: stored.role,
  isActive: stored.isActive,
  createdAt: new Date(stored.createdAt),
  updatedAt: new Date(stored.updatedAt),
});

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
      
      const storedUsers = getStoredUsers();
      const stored = storedUsers.find((u) => u.email === email);

      if (stored) {
        if (!stored.isVerified) {
          throw new Error('Email is not verified');
        }

        if (stored.password !== password) {
          throw new Error('Invalid credentials');
        }

        dispatch({ type: 'LOGIN', payload: buildUserFromStored(stored) });
        return;
      }

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

  const register = useCallback(async (params: { email: string; name: string; password: string }) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const { email, name, password } = params;

      const storedUsers = getStoredUsers();
      const existingStored = storedUsers.find((u) => u.email === email);

      if (existingStored) {
        throw new Error('Email is already registered');
      }

      const existingDemo = [
        'admin@school.com',
        'instructor@school.com',
        'student@school.com',
        'hello@gmail.com',
      ].includes(email);

      if (existingDemo) {
        throw new Error('Email is already registered');
      }

      const now = new Date().toISOString();
      const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now());

      const newStoredUser: StoredUser = {
        id,
        name,
        email,
        role: 'student',
        password,
        isActive: true,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      };

      setStoredUsers([...storedUsers, newStoredUser]);
      dispatch({ type: 'LOGIN', payload: buildUserFromStored(newStoredUser) });
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
      register,
      logout,
      updateUser,
      hasRole,
      hasAnyRole,
    }),
    [state, login, register, logout, updateUser, hasRole, hasAnyRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
