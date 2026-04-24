import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const titleMap: Record<string, string> = {
  platform: "系统管理",
  business: "业务管理",
  user: "用户管理",
  role: "角色管理",
  menu: "菜单管理",
  department: "部门管理",
  post: "岗位管理",
  "member-style": "成员风采",
  "association-intro": "协会介绍",
  "joining-guide": "入会须知",
  notice: "公告管理",
  article: "文章管理",
  "innovation-shunde": "留创顺德",
  "study-abroad-news": "留学资讯",
  banner: "轮播图管理",
  "service-platform": "留学服务平台",
  "wechat-user": "微信用户信息",
};

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments
    .slice(1)
    .map((segment) => titleMap[segment] || segment);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-white/60 bg-white/75 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>后台工作台</BreadcrumbPage>
            </BreadcrumbItem>
            {breadcrumbItems.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2">
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{item}</BreadcrumbPage>
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
