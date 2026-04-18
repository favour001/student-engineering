import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Header } from "./header/component"

export function Main({ children }: { children: React.ReactNode }) {
    return (
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    )
}