import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useSidebarStore } from "@/store/sidebar-store";

interface UnifiedLayoutProps {
  children: ReactNode;
}

export default function UnifiedLayout({ children }: UnifiedLayoutProps) {
  const { collapsed } = useSidebarStore();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar with collapsible state */}
      <Sidebar />
      
      {/* Main content area that adjusts based on sidebar state */}
      <div className={`flex flex-col flex-1 transition-all duration-300 overflow-hidden`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>
      </div>
    </div>
  );
}