import React from "react";
import Header from "./header";
import Sidebar from "./sidebar";

interface LayoutTemplateProps {
  children: React.ReactNode;
}

export default function LayoutTemplate({ children }: LayoutTemplateProps) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted">
          {children}
        </main>
      </div>
    </div>
  );
}