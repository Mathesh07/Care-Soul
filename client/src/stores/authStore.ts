import { create } from 'zustand';
import { clearAuthState, setAccessToken } from '../services/authTokenManager';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'superadmin';

export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isVerified?: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuthSession: (user: AuthUser, token: string) => void;
  clearAuthSession: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hydrateFromLegacyStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuthSession: (user, token) => {
    setAccessToken(token);
    set({ user, accessToken: token, isAuthenticated: true });
  },

  clearAuthSession: () => {
    clearAuthState();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  },

  hydrateFromLegacyStorage: () => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');

    if (!token || !rawUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUser) as AuthUser;
      setAccessToken(token);
      set({ user: parsedUser, accessToken: token, isAuthenticated: true });
    } catch {
      clearAuthState();
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },
}));
