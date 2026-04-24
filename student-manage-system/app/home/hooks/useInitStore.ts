import type { UserInfo } from "@/store";

import { useEffect } from "react";
import Cookies from "js-cookie";

import { appStore } from "@/store";

/**
 * 初始化 store，从 cookies 恢复用户信息
 */
export const useInitStore = () => {
  useEffect(() => {
    // 检查 store 中是否已有用户信息
    if (!appStore.pageDomain.home.uiDomain.layout.leftSidebar.userInfo) {
      // 从 cookies 中恢复用户信息
      const userInfoCookie = Cookies.get("userInfo");

      if (userInfoCookie) {
        try {
          const userInfo: UserInfo = JSON.parse(userInfoCookie);

          appStore.pageDomain.home.uiDomain.layout.leftSidebar.userInfo =
            userInfo;
          appStore.pageDomain.login.userId = userInfo.id;
        } catch {
          Cookies.remove("userInfo");
        }
      }
    }
  }, []);
};
