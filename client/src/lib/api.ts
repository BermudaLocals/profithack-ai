import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      if (!window.location.pathname.includes("/login")) {
        console.log("Session expired, redirecting to login...");
      }
    }
    return Promise.reject(error);
  }
);

export async function apiRequest<T = any>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.request<T>({
    method,
    url,
    data,
    ...config,
  });
  return response.data;
}

export async function fetchJson<T = any>(url: string): Promise<T> {
  const response = await api.get<T>(url);
  return response.data;
}

export async function postJson<T = any>(url: string, data: any): Promise<T> {
  const response = await api.post<T>(url, data);
  return response.data;
}

export default api;
