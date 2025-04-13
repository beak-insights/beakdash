import type { Metadata } from "next";
import { DbQaQueriesClient } from "./client-page";

export const metadata: Metadata = {
  title: "DB Quality Checks",
  description: "Create and manage database quality check queries",
};

export default async function DbQaQueriesPage() {
  return (
    <div className="flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Quality Checks</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and maintain your database quality with automated quality checks
          </p>
        </div>
      </div>
      
      <DbQaQueriesClient />
    </div>
  );
}