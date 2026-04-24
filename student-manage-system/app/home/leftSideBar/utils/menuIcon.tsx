"use client";

import type { ComponentType } from "react";

import {
  BellDot,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  FileText,
  GalleryHorizontalEnd,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  MenuSquare,
  Newspaper,
  PanelsTopLeft,
  ShieldCheck,
  SquareUserRound,
  UserCircle2,
  Users,
  UsersRound,
  Waypoints,
} from "lucide-react";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  system: ShieldCheck,
  user: Users,
  role: SquareUserRound,
  menu: MenuSquare,
  department: Building2,
  post: BriefcaseBusiness,
  business: LayoutGrid,
  "member-style": UserCircle2,
  "association-intro": PanelsTopLeft,
  "joining-guide": BookOpenText,
  notice: BellDot,
  article: FileText,
  "innovation-shunde": Waypoints,
  "study-abroad-news": GraduationCap,
  banner: GalleryHorizontalEnd,
  "service-platform": Newspaper,
  "wechat-user": UsersRound,
};

export const renderMenuIcon = (iconKey?: string) => {
  const IconComponent = iconKey ? iconMap[iconKey] : undefined;

  if (!IconComponent) {
    return <Megaphone className="size-4 text-sky-600" />;
  }

  return <IconComponent className="size-4 text-sky-600" />;
};
