import { useEffect, useState, useRef } from "react";

import { menuService } from "../services/menuService";
import {
  buildMenuTree,
  ensureBuiltInMenus,
  filterMenusByCategory,
} from "../utils/menuUtils";

import { appStore } from "@/store";

export const useMenus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // 防止重复加载（React Strict Mode 会导致 useEffect 执行两次）
    if (hasLoadedRef.current) {
      return;
    }

    const fetchMenus = async () => {
      setLoading(true);
      setError("");

      try {
        const menus = ensureBuiltInMenus(await menuService.getUserMenus());

        // Separate menus by category and build tree structure
        const platformTree = buildMenuTree(filterMenusByCategory(menus, 1));
        const projectTree = buildMenuTree(filterMenusByCategory(menus, 2));

        appStore.pageDomain.home.uiDomain.layout.leftSidebar.menu.platform =
          platformTree;
        appStore.pageDomain.home.uiDomain.layout.leftSidebar.menu.project =
          projectTree;

        hasLoadedRef.current = true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "菜单加载失败";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return {
    loading,
    error,
  };
};
