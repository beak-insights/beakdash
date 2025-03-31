import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  
  return (
    <div className="flex min-h-screen">
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