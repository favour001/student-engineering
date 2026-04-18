"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { MenuItem } from "@/store"
import { renderMenuIcon } from "../utils/menuIcon"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMenuPlatform({
  items,
}: {
  items: MenuItem[]
}) {
  if (!items || items.length === 0) {
    return null
  }
  return (
      <SidebarGroup>
      <SidebarGroupLabel>系统管理</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.id}
            asChild
            defaultOpen={false}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip={item.name}
                >
                  <span className="flex size-7 items-center justify-center rounded-xl bg-sky-50 ring-1 ring-sky-100">
                    {renderMenuIcon(item.icon)}
                  </span>
                  <span>{item.name}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.children?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.id}>
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.path || '#'}>
                          <span className="flex size-6 items-center justify-center rounded-lg bg-white/80 ring-1 ring-slate-200">
                            {renderMenuIcon(subItem.icon)}
                          </span>
                          <span>{subItem.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
