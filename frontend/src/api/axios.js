import axios from "axios";
import { getMockResponse } from "../data/demoData";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ─── Demo Mode Interceptor ────────────────────────────────────────────────────
// When demo mode is active, intercept every request and return mock data.
// This means ALL existing pages work exactly the same — they just get
// realistic mock data instead of real backend responses.
api.interceptors.request.use((config) => {
  const isDemoMode = sessionStorage.getItem("demoMode") === "true";
  if (isDemoMode) {
    config.adapter = async () => {
      // Small artificial delay so loading spinners appear (realistic UX)
      await new Promise((resolve) => setTimeout(resolve, 250));
      const mockData = getMockResponse(
        config.url || "",
        config.method || "get",
        config.params || {}
      );
      return {
        data: mockData,
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        config,
        request: {},
      };
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      console.error("API Error:", error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default api;
