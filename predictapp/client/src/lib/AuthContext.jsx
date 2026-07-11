import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      localStorage.removeItem('hackbet_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (username, password) => {
    const { token, user } = await api.login(username, password);
    localStorage.setItem('hackbet_token', token);
    setUser(user);
  };

  const register = async (username, password) => {
    const { token, user } = await api.register(username, password);
    localStorage.setItem('hackbet_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('hackbet_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
