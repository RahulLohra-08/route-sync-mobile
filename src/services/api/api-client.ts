import axios from "axios";

import { getAccessToken } from "@/services/auth/token.service";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log("RouteSync API URL:", API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    console.log("Auth token exists:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      console.log(
        "Authorization header attached:",
        config.headers.Authorization.substring(0, 30) + "..."
      );
    } else {
      console.log("⚠️ No access token found");
    }

    console.log("API Request:", {
      method: config.method,
      url: `${config.baseURL}${config.url}`,
      data: config.data,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });

    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);