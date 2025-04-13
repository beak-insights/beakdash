'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Connection } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDbQaQueries } from '@/lib/hooks/use-db-qa-queries';
import { useSpaces } from '@/lib/hooks/use-spaces';
import { DbQaQueryForm } from '@/components/db-qa/query-form';

interface CreateDbQaQueryClientProps {
  connections: Connection[];
}

export function CreateDbQaQueryClient({ connections }: CreateDbQaQueryClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { currentSpaceId } = useSpaces();
  const { createDbQaQueryMutation } = useDbQaQueries();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Add the current space ID to the data if available
      const queryData = {
        ...data,
        spaceId: currentSpaceId || null,
      };

      await createDbQaQueryMutation.mutateAsync(queryData);
      toast({
        title: 'Success',
        description: 'Quality check created successfully',
      });
      router.push('/db-qa/queries');
    } catch (error) {
      console.error('Error creating quality check:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create quality check',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        onClick={() => router.push('/db-qa/queries')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Quality Checks
      </Button>

      <Card>
        <CardContent className="pt-6">
          <DbQaQueryForm 
            connections={connections}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}