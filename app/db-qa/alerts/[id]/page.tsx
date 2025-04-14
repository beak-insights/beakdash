import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { ViewAlertClient } from "./client-page";

export const metadata: Metadata = {
  title: "View DB Quality Alert",
  description: "View and manage database quality alert details",
};

interface ViewAlertPageProps {
  params: {
    id: string;
  };
}

export default async function ViewAlertPage({ params }: ViewAlertPageProps) {
  const id = await params.id;
  
  return (
    <AppLayout>
      <div className="flex flex-col p-6 max-w-7xl mx-auto w-full">
        <ViewAlertClient id={id} />
      </div>
    </AppLayout>
  );
}