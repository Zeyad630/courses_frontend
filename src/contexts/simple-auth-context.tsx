import type { User, UserRole, AuthState } from 'src/types/user';

import { useMemo, useEffect, useContext, useReducer, useCallback, createContext } from 'react';

import { storage } from 'src/utils/storage';

import { authApi } from 'src/api';

// ----------------------------------------------------------------------

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  register: (params: {
    email: string;
    password: string;
    nationalId: string;
    fullNameEn: string;
    fullNameAr: string;
    phone: string;
    educationalLevelId: number;
  }) => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
};

// ----------------------------------------------------------------------

const mapBackendRoleToRole = (params: { roleId?: number; roleName?: string | null }): UserRole => {
  const roleName = (params.roleName ?? '').toLowerCase().trim();
  if (roleName.includes('engineer')) return 'admin';
  if (roleName.includes('co-instructor') || roleName.includes('co instructor') || roleName.includes('instructor') || roleName.includes('teacher')) {
    return 'instructor';
  }

  const roleId = params.roleId;
  if (roleId === 1) return 'admin';
  if (roleId === 2) return 'instructor';
  return 'student';
};

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  try {
    const savedUser = localStorage.getItem('auth_user');
    const token = localStorage.getItem('accessToken');
    
    if (savedUser && token) {
      const user = JSON.parse(savedUser);
      // Convert date strings back to Date objects
      if (user.createdAt) user.createdAt = new Date(user.createdAt);
      if (user.updatedAt) user.updatedAt = new Date(user.updatedAt);
      
      return {
        user,
        isAuthenticated: true,
        isLoading: false,
      };
    }
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('auth_user');
    localStorage.removeItem('accessToken');
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
      localStorage.removeItem('accessToken');
    }
  }, [state.user]);

  // Try to restore session from token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('auth_user');
    
    if (token && savedUser && !state.user) {
      // Token exists, try to fetch user info
      dispatch({ type: 'SET_LOADING', payload: true });
      authApi.getMe()
        .then((userInfo) => {
          if (userInfo.accountId && userInfo.email) {
            const user: User = {
              id: String(userInfo.accountId),
              name: userInfo.email.split('@')[0], // Use email prefix as name fallback
              email: userInfo.email,
              role: mapBackendRoleToRole({ roleId: Number(userInfo.roleId ?? 3), roleName: null }),
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            dispatch({ type: 'LOGIN', payload: user });
          } else {
            // Invalid token, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('auth_user');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('auth_user');
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    }
  }, []); // Only run on mount

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await authApi.login({ email, password });

      const token = response.accessToken ?? response.token;
      if (token) storage.setToken(token);

      const user: User = {
        id: String(response.accountId),
        name: email.split('@')[0],
        email: response.email,
        role: mapBackendRoleToRole({ roleId: response.roleId, roleName: response.roleName }),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storage.setUser(user);
      dispatch({ type: 'LOGIN', payload: user });
      return user;
    } catch (error: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      if (error instanceof Error) throw error;
      throw new Error('Login failed');
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await authApi.googleAuth({ idToken });
      const token = response.accessToken ?? response.token;
      if (token) storage.setToken(token);

      // Fetch user profile to get full name
      let userName = response.email.split('@')[0];
      try {
        const profile = await authApi.getProfile();
        userName = profile.fullNameEn || userName;
      } catch {
        // Use email if profile fetch fails
      }

      const user: User = {
        id: String(response.accountId),
        name: userName,
        email: response.email,
        role: mapBackendRoleToRole({ roleId: response.roleId, roleName: response.roleName }),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storage.setUser(user);
      dispatch({ type: 'LOGIN', payload: user });
      return user;
    } catch (error: unknown) {
      dispatch({ type: 'SET_LOADING', payload: false });
      if (error instanceof Error) throw error;
      throw new Error('Google authentication failed');
    }
  }, []);

  const register = useCallback(
    async (params: {
      email: string;
      password: string;
      nationalId: string;
      fullNameEn: string;
      fullNameAr: string;
      phone: string;
      educationalLevelId: number;
    }) => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await authApi.signup({
          fullNameEn: params.fullNameEn,
          fullNameAr: params.fullNameAr,
          nationalId: params.nationalId,
          phone: params.phone,
          email: params.email,
          password: params.password,
          educationalLevelId: params.educationalLevelId,
        });

        const token = response.accessToken ?? response.token;
        if (token) storage.setToken(token);

        const user: User = {
          id: String(response.accountId),
          name: params.fullNameEn || params.email.split('@')[0],
          email: response.email,
          role: mapBackendRoleToRole({ roleId: response.roleId, roleName: response.roleName }),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          phone: params.phone,
        };

        storage.setUser(user);
        dispatch({ type: 'LOGIN', payload: user });
        return user;
      } catch (error: unknown) {
        dispatch({ type: 'SET_LOADING', payload: false });
        if (error instanceof Error) throw error;
        throw new Error('Registration failed');
      }
    },
    []
  );

  const logout = useCallback(() => {
    storage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback(
    (updates: Partial<User>) => dispatch({ type: 'UPDATE_USER', payload: updates }),
    []
  );
  const hasRole = useCallback((role: UserRole) => state.user?.role === role, [state.user?.role]);

  const hasAnyRole = useCallback((roles: UserRole[]) => state.user ? roles.includes(state.user.role) : false, [state.user]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      loginWithGoogle,
      register,
      logout,
      updateUser,
      hasRole,
      hasAnyRole,
    }),
    [state, login, loginWithGoogle, register, logout, updateUser, hasRole, hasAnyRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
