import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api, setAccessToken } from './api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'STAFF';
}

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const refresh = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (!refresh.ok) throw new Error('no session');
        const { accessToken } = (await refresh.json()) as { accessToken: string };
        setAccessToken(accessToken);
        const me = await api.get<User>('/auth/me');
        if (!cancelled) setUser(me.data);
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      login: async (email, password) => {
        const res = await api.post<{ accessToken: string; user: User }>('/auth/login', {
          email,
          password,
        });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } finally {
          setAccessToken(null);
          setUser(null);
        }
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
