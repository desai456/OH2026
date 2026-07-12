import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const API = "http://localhost:8000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for stored token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user_data");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch { /* ignore logout errors */ }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    setUser(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      setUser(data.user);
      return data.access_token;
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      setUser(null);
      return null;
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem("user_data", JSON.stringify(next));
      return next;
    });
  }, []);

  const hasRole = useCallback((roleName) => {
    return user?.role_name === roleName || user?.role_name === "Super Admin";
  }, [user]);

  const hasPermission = useCallback((permName) => {
    if (!user?.permissions) return false;
    if (user.role_name === "Super Admin") return true;
    return user.permissions.includes(permName);
  }, [user]);

  const hasModuleAccess = useCallback((moduleId) => {
    if (!user) return false;
    if (user.role_name === "Super Admin") return true;
    if (!user.permissions) return false;
    return user.permissions.some((p) => p.startsWith(moduleId + "."));
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
    updateUser,
    hasRole,
    hasPermission,
    hasModuleAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
