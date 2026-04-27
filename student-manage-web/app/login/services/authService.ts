import type { LoginRequest, LoginResponse } from "../types";

import axios from "axios";
import Cookies from "js-cookie";

import apiClient from "@/utils/request";

const getCookieOptions = (days: number) => ({
  expires: days,
  secure:
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : false,
  sameSite: "lax" as const,
});

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials,
      );
      const { access_token, refresh_token } = response.data;

      if (access_token) {
        Cookies.set("access_token", access_token, getCookieOptions(1));
      }
      if (refresh_token) {
        Cookies.set("refresh_token", refresh_token, getCookieOptions(7));
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg ||
          error.response?.data?.message ||
          "登录失败";

        throw new Error(errorMessage);
      }
      throw new Error("登录失败");
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
    } finally {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
    }
  },
};
