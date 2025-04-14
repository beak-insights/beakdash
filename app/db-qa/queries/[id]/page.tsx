import type { Metadata } from "next";
import { ViewQueryClient } from "./client-page";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  title: "View Database Quality Check",
  description: "View and run database quality check details",
};

interface ViewQueryPageProps {
  params: {
    id: string;
  };
}

export default function ViewQueryPage({ params }: ViewQueryPageProps) {
  return (
    <AppLayout>
      <div className="container mx-auto py-10">
        <ViewQueryClient id={params.id} />
      </div>
    </AppLayout>
  );
}