import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type User = {
  id: number;
  roles: any;
  email: string;
  full_name: string;
  subscription_status: string;
} | null;

interface AuthContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  refreshUser: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  function isTokenExpired(token: string): boolean {
    try {
      const [, payloadBase64] = token.split(".");
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < now;
    } catch {
      return true;
    }
  }

  const getAccessToken = () =>
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

  const getRefreshToken = () =>
    localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");

  const storeTokens = (access: string, refresh: string, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("access_token", access);
    storage.setItem("refresh_token", refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch("http://localhost:8000/auth/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to refresh token");

      const data = await res.json();
      const access_token = data.access_token;

      // Assume user used "remember me" if token is in localStorage
      const rememberMe = !!localStorage.getItem("refresh_token");
      storeTokens(access_token, refreshToken, rememberMe);

      return access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return null;
    }
  };

  const checkUser = async () => {
    let token = getAccessToken();

    if (!token || isTokenExpired(token)) {
      token = await refreshAccessToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    setLoading(true);
    await checkUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
