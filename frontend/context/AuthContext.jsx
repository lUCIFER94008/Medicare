"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Read token from localStorage on initial load
    const storedToken = localStorage.getItem("medicare_token");
    if (storedToken) {
      setToken(storedToken);
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/auth/me");
      if (res.success) {
        setUser(res.user);
      }
    } catch (err) {
      console.error("Session restored failed:", err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await apiPost("/auth/login", { email, password });
    if (res.success) {
      localStorage.setItem("medicare_token", res.token);
      setToken(res.token);
      setUser(res.user);

      // Redirect by role
      if (res.user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (res.user.role === "doctor") {
        router.push("/doctor/dashboard");
      } else {
        router.push("/patient/dashboard");
      }
    }
    return res;
  };

  const register = async (userData) => {
    const res = await apiPost("/auth/register", userData);
    if (res.success) {
      router.push("/login?registered=true");
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem("medicare_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        fetchMe,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
