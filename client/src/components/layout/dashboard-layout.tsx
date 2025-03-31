import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "@/hooks/use-auth";
import { useSidebarStore } from "@/store/sidebar-store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const { collapsed } = useSidebarStore();
  
  // Mark when the component has mounted to avoid hydration issues
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar with collapsible state */}
      <Sidebar />
      
      {/* Main content area that adjusts based on sidebar state */}
      <div className={`flex flex-col flex-1 transition-all duration-300`}>
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}