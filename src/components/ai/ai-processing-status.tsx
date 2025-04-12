import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface AIStatusProps {
  datasetKey: string;
}

/**
 * Component to display real-time AI processing status
 */
export function AIProcessingStatus({ datasetKey }: AIStatusProps) {
  const { subscribe } = useWebSocket();
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

  // Subscribe to WebSocket events for AI updates
  useEffect(() => {
    const unsubscribe = subscribe('data-update', (event) => {
      if (event.type === 'data-update' && event.dataset === datasetKey) {
        const data = event.data as any;
        setProcessingStatus({
          status: data.status,
          message: data.message,
          requestId: data.requestId,
          timestamp: event.timestamp
        });
      }
    });
    
    // Also subscribe to error events
    const unsubscribeErrors = subscribe('error', (event) => {
      if (event.type === 'error') {
        setProcessingStatus({
          status: 'error',
          message: event.message,
          timestamp: event.timestamp
        });
      }
    });
    
    return () => {
      unsubscribe();
      unsubscribeErrors();
    };
  }, [subscribe, datasetKey]);
  
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