import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface AIStatusProps {
  datasetKey: string;
}

/**
 * Component to display AI processing status using polling
 */
export function AIProcessingStatus({ datasetKey }: AIStatusProps) {
  const [processingStatus, setProcessingStatus] = useState<{
    status: 'idle' | 'processing' | 'sending' | 'completed' | 'error';
    message: string;
    requestId?: string;
    timestamp?: string;
  }>({
    status: 'idle',
    message: ''
  });

  // Reset to idle after completion
  useEffect(() => {
    if (processingStatus.status === 'completed') {
      const timer = setTimeout(() => {
        setProcessingStatus({ status: 'idle', message: '' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [processingStatus.status]);

  // Poll for status updates
  useEffect(() => {
    if (processingStatus.status === 'idle') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/status/${datasetKey}`);
        if (!response.ok) throw new Error('Failed to fetch status');
        
        const data = await response.json();
        setProcessingStatus({
          status: data.status,
          message: data.message,
          requestId: data.requestId,
          timestamp: data.timestamp
        });

        // Stop polling if processing is complete or there's an error
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling AI status:', error);
        setProcessingStatus({
          status: 'error',
          message: 'Failed to check processing status',
          timestamp: new Date().toISOString()
        });
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [datasetKey, processingStatus.status]);

  if (processingStatus.status === 'idle') {
    return null;
  }
  
  return (
    <Alert 
      className={`mt-2 transition-all duration-300 ${
        processingStatus.status === 'error' 
          ? 'bg-red-50 border-red-200 text-red-800' 
          : processingStatus.status === 'completed'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}
    >
      <div className="flex items-center">
        {processingStatus.status !== 'completed' && processingStatus.status !== 'error' && (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        )}
        <AlertTitle>
          {processingStatus.status === 'processing' && 'Processing...'}
          {processingStatus.status === 'sending' && 'Sending request...'}
          {processingStatus.status === 'completed' && 'Completed'}
          {processingStatus.status === 'error' && 'Error'}
        </AlertTitle>
      </div>
      <AlertDescription className="mt-1 text-sm">
        {processingStatus.message}
      </AlertDescription>
    </Alert>
  );
}