import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

import { toBrowserAppPath } from "@/lib/app-route";

const getBackendUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8888"
  ).replace(/\/+$/, "");
};

const getBackendApiUrl = (): string => {
  const backendUrl = getBackendUrl();

  return backendUrl.endsWith("/api") ? backendUrl : `${backendUrl}/api`;
};

const getCookieOptions = (days: number) => ({
  expires: days,
  secure:
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : false,
  sameSite: "lax" as const,
});

const apiClient = axios.create({
  baseURL: getBackendApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = Cookies.get("access_token");

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${getBackendApiUrl()}/auth/refresh`,
          {
            refresh_token: refreshToken,
          },
        );

        const tokenData = response.data.data || response.data;
        const { access_token, refresh_token: newRefreshToken } = tokenData;

        Cookies.set("access_token", access_token, getCookieOptions(1));
        if (newRefreshToken) {
          Cookies.set("refresh_token", newRefreshToken, getCookieOptions(7));
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = toBrowserAppPath("/login");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
