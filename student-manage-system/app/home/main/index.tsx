import { Header } from "./header/component";

import { SidebarInset } from "@/components/ui/sidebar";

export function Main({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <Header />
      {children}
    </SidebarInset>
  );
}
