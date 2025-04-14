import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { AlertsClient } from "./client-page";

export const metadata: Metadata = {
  title: "DB Quality Alerts",
  description: "Manage database quality alerts and notifications",
};

export default async function AlertsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DB Quality Alerts</h1>
            <p className="text-muted-foreground mt-1">
              Monitor database quality and get notified of issues
            </p>
          </div>
        </div>
        
        <AlertsClient />
      </div>
    </AppLayout>
  );
}