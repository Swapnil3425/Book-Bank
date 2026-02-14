import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { showToast } from "../utils/toastService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    fetchMe();
  }, []);

  // Session timeout (15 minutes)
  useEffect(() => {
    let timer;
    if (user) {
      timer = setTimeout(async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // ignore
        }
        setUser(null);
        showToast("Session expired. Please log in again.", "error");
      }, 15 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [user]);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    setUser(data);
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setUser(data);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/me", payload);
    setUser(data);
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
