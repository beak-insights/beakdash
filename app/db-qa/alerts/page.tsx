import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { AlertsClient } from "./client-page";
import { Header } from "@/components/layout/header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DB Quality Alerts",
  description: "Manage database quality alerts and notifications",
};

export default async function AlertsPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <Header title="DB Quality Alerts" description="">
          <Link
            href="/db-qa/alerts/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
          >
            Create New Alert
          </Link>
        </Header>
        <div className="p-4">
          <AlertsClient />
        </div>
      </div>
    </AppLayout>
  );
}