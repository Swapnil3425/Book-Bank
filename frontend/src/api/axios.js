import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true
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
