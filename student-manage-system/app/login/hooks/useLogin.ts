import type { LoginRequest } from "../types";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { authService } from "../services/authService";

import { appStore } from "@/store";

const getCookieOptions = (days: number) => ({
  expires: days,
  secure:
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : false,
  sameSite: "lax" as const,
});

export const useLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "authenticating" | "redirecting">(
    "idle",
  );

  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError("");
    setPhase("authenticating");

    try {
      const loginData = await authService.login(credentials);
      const userInfo = {
        id: loginData.id,
        userName: loginData.userName,
        account: loginData.account,
        email: loginData.email,
        phoneNumber: loginData.phoneNumber,
        profileImage: loginData.profileImage,
      };

      appStore.pageDomain.login.userId = loginData.id;
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.userInfo = userInfo;

      Cookies.set("userInfo", JSON.stringify(userInfo), getCookieOptions(7));

      setPhase("redirecting");
      router.replace("/home");

      return loginData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "登录失败";

      setError(errorMessage);
      setPhase("idle");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    phase,
    error,
    setError,
  };
};
