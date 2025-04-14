import type { Metadata } from "next";
import { DbQaAlertsClient } from "./client-page";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  title: "DB Quality Alerts",
  description: "Manage and monitor database quality alerts",
};

export default async function DbQaAlertsPage() {
  return (
    <AppLayout>
      <div className="flex flex-col p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quality Alerts</h1>
            <p className="text-muted-foreground mt-1">
              Configure and monitor alerts from your database quality checks
            </p>
          </div>
        </div>
        
        <DbQaAlertsClient />
      </div>
    </AppLayout>
  );
}