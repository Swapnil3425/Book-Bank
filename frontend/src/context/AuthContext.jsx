import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { showToast } from "../utils/toastService";
import { useDemoMode } from "./DemoContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isDemoMode, demoUser, exitDemo } = useDemoMode();
  const [realUser, setRealUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // The effective user is the demo user when in demo mode, otherwise the real user
  const user = isDemoMode ? demoUser : realUser;

  useEffect(() => {
    // Demo mode is handled via demoUser from DemoContext — no API call needed
    if (isDemoMode) {
      setInitializing(false);
      return;
    }

    const fetchMe = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setRealUser(data);
      } catch {
        setRealUser(null);
      } finally {
        setInitializing(false);
      }
    };
    fetchMe();
  }, [isDemoMode]);

  // Session timeout (15 minutes) — skip for demo users
  useEffect(() => {
    let timer;
    if (realUser && !isDemoMode) {
      timer = setTimeout(async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // ignore
        }
        setRealUser(null);
        showToast("Session expired. Please log in again.", "error");
      }, 15 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [realUser, isDemoMode]);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    setRealUser(data);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setRealUser(data);
  };

  const logout = async () => {
    // Exit demo mode cleanly if applicable
    if (isDemoMode) {
      exitDemo();
      setInitializing(false);
      return;
    }
    await api.post("/auth/logout");
    setRealUser(null);
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/me", payload);
    if (!isDemoMode) setRealUser(data);
  };

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

