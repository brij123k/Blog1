import axios from "axios";
import { storage } from "./storage";
import {API} from "./api"
const axiosInstance = axios.create({
  baseURL: `${API}/api/v1`,
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