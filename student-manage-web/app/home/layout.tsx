"use client";

import { useInitStore } from "./hooks/useInitStore";
import { useMenus } from "./leftSideBar/hooks/useMenus";

import { LeftSidebar } from "@/app/home/leftSideBar";
import { Main } from "@/app/home/main";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 初始化 store，从 cookies 恢复用户信息
  useInitStore();

  // 在 home 页面加载时获取菜单数据
  useMenus();

  return (
    <SidebarProvider>
      <LeftSidebar />
      <Main>{children}</Main>
    </SidebarProvider>
  );
}
