import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  
  // Mark when the component has mounted to avoid hydration issues
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return (
    <div className="flex min-h-screen">
      {/* Only render the sidebar once we've mounted on the client
          This prevents flash of incorrect content and maintains user state */}
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}