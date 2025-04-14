import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { NewAlertClient } from "./client-page";

export const metadata: Metadata = {
  title: "Create New DB Quality Alert",
  description: "Set up automated notifications for database quality issues",
};

export default async function NewAlertPage() {
  return (
    <AppLayout>
      <div className="flex flex-col p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Alert</h1>
            <p className="text-muted-foreground mt-1">
              Set up automated notifications for database quality issues
            </p>
          </div>
        </div>
        
        <NewAlertClient />
      </div>
    </AppLayout>
  );
}