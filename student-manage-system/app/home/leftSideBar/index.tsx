"use client"

import * as React from "react"
import { useSnapshot } from "valtio"

import { NavLogo } from "./components/NavLogo"
import { NavMenuPlatform } from "./components/NavMenuPlatform"
import { NavMenuProject } from "./components/NavMenuProject"
import { NavUser } from "./components/NavUser"
import { appStore } from "@/store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function LeftSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const snap = useSnapshot(appStore)
  const userInfo = snap.pageDomain.home.uiDomain.layout.leftSidebar.userInfo
  const platformMenus = JSON.parse(JSON.stringify(snap.pageDomain.home.uiDomain.layout.leftSidebar.menu.platform))
  const projectMenus = JSON.parse(JSON.stringify(snap.pageDomain.home.uiDomain.layout.leftSidebar.menu.project))
  console.log(platformMenus)
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMenuPlatform items={platformMenus} />
        <NavMenuProject projects={projectMenus} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
