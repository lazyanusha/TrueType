import React, { createContext, useState, useEffect, type ReactNode } from "react";
import { authFetch } from "../utils/authfetch";

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

  // Clear tokens from all storages on logout
  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  // Fetch user info using authFetch which handles token refreshing
  const checkUser = async () => {
    setLoading(true);
    try {
      const res = await authFetch("http://localhost:8000/users/me");
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

  // Initial load: get user info
  useEffect(() => {
    checkUser();
  }, []);

  // Manual refresh user function exposed via context
  const refreshUser = async () => {
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
