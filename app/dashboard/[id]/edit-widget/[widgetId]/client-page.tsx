'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from "@/components/layout/app-layout";
import WidgetEditor from "@/components/widgets/widget-editor";
import { Widget } from "@/lib/db/schema";

interface EditWidgetClientProps {
  dashboardId: number;
  widget: Widget;
}

export function EditWidgetClient({ dashboardId, widget }: EditWidgetClientProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push(`/dashboard/${dashboardId}`);
  };

  return (
    <AppLayout>
      <WidgetEditor
        dashboardId={dashboardId}
        widget={widget}
        onClose={handleClose}
      />
    </AppLayout>
  );
} 