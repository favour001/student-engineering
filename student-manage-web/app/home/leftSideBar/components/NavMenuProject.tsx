"use client";

import {
  ChevronRight,
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { renderMenuIcon } from "../utils/menuIcon";

import { MenuItem } from "@/store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMenuProject({ projects }: { projects: MenuItem[] }) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleMenuClick = (path?: string) => {
    if (path) {
      router.push(path);
    }
  };

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>业务管理</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <Collapsible
            key={item.id}
            asChild
            className="group/collapsible"
            defaultOpen={item.children?.length ? true : false}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  onClick={() =>
                    !item.children?.length && handleMenuClick(item.path)
                  }
                >
                  <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                    {renderMenuIcon(item.icon)}
                  </span>
                  <span>{item.name}</span>
                  {item.children?.length ? (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  ) : null}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isMobile ? "end" : "start"}
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                >
                  <DropdownMenuItem onClick={() => handleMenuClick(item.path)}>
                    <Folder className="text-muted-foreground" />
                    <span>进入模块</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMenuClick(item.path)}>
                    <Forward className="text-muted-foreground" />
                    <span>继续管理</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleMenuClick("/home")}>
                    <Trash2 className="text-muted-foreground" />
                    <span>返回总览</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {item.children?.length ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.children.map((child) => (
                      <SidebarMenuSubItem key={child.id}>
                        <SidebarMenuSubButton asChild>
                          <button
                            className="flex w-full items-center gap-2"
                            type="button"
                            onClick={() => handleMenuClick(child.path)}
                          >
                            <span className="flex size-6 items-center justify-center rounded-lg bg-white/80 ring-1 ring-slate-200">
                              {renderMenuIcon(child.icon)}
                            </span>
                            <span>{child.name}</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
