import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/app-layout";
import { NewQueryClient } from "./client-page";

export const metadata: Metadata = {
  title: "Create New Query - DB QA - BeakDash",
  description: "Create a new database quality check query",
};

export default async function NewQueryPage() {
  return (
    <AppLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/db-qa/queries">
              <ChevronLeft className="h-4 w-4 mr-1.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create New Quality Check Query</h1>
        </div>
        
        <NewQueryClient />
      </div>
    </AppLayout>
  );
}