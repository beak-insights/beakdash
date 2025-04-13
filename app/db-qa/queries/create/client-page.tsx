'use client';

import { useRouter } from "next/navigation";
import { Connection } from "@/lib/db/schema";
import { DbQaQueryForm } from "@/components/db-qa/query-form";

interface CreateDbQaQueryClientProps {
  connections: Connection[];
}

export function CreateDbQaQueryClient({ connections }: CreateDbQaQueryClientProps) {
  const router = useRouter();
  
  const handleSuccess = (data: any) => {
    // Redirect to the query detail page or back to the queries list
    router.push(`/db-qa/queries`);
  };
  
  return (
    <DbQaQueryForm 
      connections={connections}
      onSuccess={handleSuccess}
    />
  );
}