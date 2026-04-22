import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyAuthHeader,
  clearAuth,
  getStoredSession,
  getStoredToken,
  login as apiLogin,
  persistAuth,
  register as apiRegister,
  type SessionInfo,
} from "../api/client";

interface AuthState {
  token: string | null;
  session: SessionInfo | null;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadInitial(): AuthState {
  const token = getStoredToken();
  const session = getStoredSession();
  if (token) applyAuthHeader(token);
  return { token, session };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadInitial);

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    persistAuth(data.accessToken, { username: data.username, role: data.role });
    applyAuthHeader(data.accessToken);
    setState({ token: data.accessToken, session: { username: data.username, role: data.role } });
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const data = await apiRegister(username, email, password);
    persistAuth(data.accessToken, { username: data.username, role: data.role });
    applyAuthHeader(data.accessToken);
    setState({ token: data.accessToken, session: { username: data.username, role: data.role } });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    applyAuthHeader(null);
    setState({ token: null, session: null });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
    }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
