"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { useLogout } from "../hooks/useLogout";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { resolveAssetUrl } from "@/utils/upload";

export function NavUser({
  user,
}: {
  user: {
    userName: string;
    email?: string;
    profileImage?: string;
  } | null;
}) {
  const { isMobile } = useSidebar();
  const { logout, loading } = useLogout();

  if (!user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                <AvatarImage
                  alt={user.userName}
                  key={user.profileImage || "empty-avatar"}
                  src={
                    user.profileImage
                      ? resolveAssetUrl(user.profileImage)
                      : undefined
                  }
                />
                <AvatarFallback className="rounded-lg">
                  {user.userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.userName}</span>
                <span className="truncate text-xs">{user.email || ""}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex min-w-0 items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                  <AvatarImage
                    alt={user.userName}
                    key={user.profileImage || "empty-avatar-menu"}
                    src={
                      user.profileImage
                        ? resolveAssetUrl(user.profileImage)
                        : undefined
                    }
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.userName}</span>
                  <span className="truncate text-xs">{user.email || ""}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={loading} onClick={logout}>
              <LogOut />
              {loading ? "登出中..." : "登出"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
