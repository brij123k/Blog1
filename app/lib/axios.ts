import axios from "axios";
import { storage } from "./storage";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:5000/api/v1",
//   timeout: 120000,
// });
const axiosInstance = axios.create({
  baseURL: "https://hammerhead-app-7hn5u.ondigitalocean.app/api/v1",
  timeout: 120000,
});
axiosInstance.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;