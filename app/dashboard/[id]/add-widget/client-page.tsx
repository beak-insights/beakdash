'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from "@/components/layout/app-layout";
import WidgetEditor from "@/components/widgets/widget-editor";

interface AddWidgetClientProps {
  dashboardId: number;
}

export function AddWidgetClient({ dashboardId }: AddWidgetClientProps) {
  const router = useRouter();

  const handleClose = () => {
    router.push(`/dashboard/${dashboardId}`);
  };

  return (
    <AppLayout>
      <WidgetEditor
        dashboardId={dashboardId}
        onClose={handleClose}
      />
    </AppLayout>
  );
} 