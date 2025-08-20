'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (username: string, passcode: string, stayLoggedIn?: boolean) => Promise<void>;
  register: (username: string, passcode: string, invitationCode: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const API_URL = typeof window === 'undefined' && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : '';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: async (username: string, passcode: string, stayLoggedIn = false) => {
        try {
          const response = await fetch(`/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username,
              passcode,
              stayLoggedIn,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          // Store token in localStorage for API requests
          localStorage.setItem('token', data.token);

          set({
            isAuthenticated: true,
            user: data.user,
            token: data.token,
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      register: async (username: string, passcode: string, invitationCode: string) => {
        try {
          const response = await fetch(`/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username,
              passcode,
              invitationCode,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
          }

          // Registration successful - user can now log in
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token') || get().token;
          
          if (!token) {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
            });
            return false;
          }

          const response = await fetch(`/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            set({
              isAuthenticated: true,
              user: data.user,
              token,
            });
            return true;
          } else {
            // Token is invalid or expired
            localStorage.removeItem('token');
            set({
              isAuthenticated: false,
              user: null,
              token: null,
            });
            return false;
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('token');
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return false;
        }
      },
    }),
    {
      name: 'zurdir-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);