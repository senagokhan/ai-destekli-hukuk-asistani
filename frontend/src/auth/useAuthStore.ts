import { create } from 'zustand';
import apiClient from '@/api/axios';
import { AUTH } from '@/api/endpoints';
import { User, TokenResponse, LoginRequest, RegisterRequest } from '@/api/types';

interface AuthState {
  user: User | null;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  bootstrapFromStorage: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setRoles: (roles: string[]) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  roles: [],
  accessToken: null,
  refreshToken: null,
  isBootstrapping: true,
  isAuthenticated: false,

  // Actions
  login: async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.post<TokenResponse>(AUTH.LOGIN, credentials);
      const { accessToken, refreshToken } = response.data;
      
      get().setTokens(accessToken, refreshToken);
      
      // Get user info
      await get().bootstrapFromStorage();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      const response = await apiClient.post<TokenResponse>(AUTH.REGISTER, data);
      const { accessToken, refreshToken } = response.data;
      
      get().setTokens(accessToken, refreshToken);
      
      // Get user info
      await get().bootstrapFromStorage();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      roles: [],
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  refresh: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<TokenResponse>(AUTH.REFRESH, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      get().setTokens(accessToken, newRefreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout();
      throw error;
    }
  },

  bootstrapFromStorage: async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        set({ isBootstrapping: false });
        return;
      }

      set({ accessToken, refreshToken });

      // Get user info
      const response = await apiClient.get(AUTH.ME);
      const user = response.data as User;
      
      // Extract roles from token (this would need JWT decoding in a real app)
      // For now, we'll assume ROLE_LAWYER for registered users
      const roles = ['ROLE_LAWYER'];

      set({
        user,
        roles,
        isAuthenticated: true,
        isBootstrapping: false,
      });
    } catch (error) {
      console.error('Bootstrap failed:', error);
      get().logout();
      set({ isBootstrapping: false });
    }
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  setUser: (user: User) => {
    set({ user });
  },

  setRoles: (roles: string[]) => {
    set({ roles });
  },
}));
