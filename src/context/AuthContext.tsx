import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile } from '../types.js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('interview_auth_token'));
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
      } else {
        // Invalid or expired token
        localStorage.removeItem('interview_auth_token');
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Failed to fetch authenticated user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }

    localStorage.setItem('interview_auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, phone }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    localStorage.setItem('interview_auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
  };

  const logout = () => {
    localStorage.removeItem('interview_auth_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Profile> => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    setProfile(data.profile);
    if (updates.full_name && user) {
      setUser({ ...user, full_name: updates.full_name });
    }
    return data.profile;
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatar_url: avatarUrl }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update avatar');
    }

    if (profile) {
      setProfile({ ...profile, avatar_url: data.avatar_url });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        refreshUser,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
