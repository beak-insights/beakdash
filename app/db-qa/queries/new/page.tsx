import type { Metadata } from "next";
import { NewQueryClient } from "./client-page";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  title: "Create New Database Quality Check",
  description: "Create a new database quality check",
};

export default function NewQueryPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create Quality Check</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new database quality check to monitor your data
          </p>
        </div>
        
        <NewQueryClient />
      </div>
    </AppLayout>
  );
}