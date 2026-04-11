import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';

function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

export function useAuth() {
  const navigate = useNavigate();
  const { accessToken, refreshToken, user, setTokens, setUser, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const hydrateUserFromToken = (token: string) => {
    const payload = parseJwt(token);
    if (payload) {
      // In a real app we'd trigger a GET /me to fetch full_name, but for now we mock the full name or load it
      setUser({
        id: payload.sub,
        email: 'user@equiscore.ai', // Will be populated realistically via GET /me
        fullName: 'User', 
        role: payload.role || 'user',
        hackathonId: payload.hackathon_id || null,
      });
    }
  };

  const login = async (email: string, password: string, hackathonSlug?: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password, hackathonSlug);
      setTokens(response.access_token, response.refresh_token);
      hydrateUserFromToken(response.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await api.logout();
      }
    } catch (e) {
      console.warn('Logout hook failed remotely');
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [accessToken, clearAuth, navigate]);

  return {
    user,
    isAuthenticated: !!accessToken,
    login,
    logout,
    isLoading,
    hydrateUserFromToken
  };
}
