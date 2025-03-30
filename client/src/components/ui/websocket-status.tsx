import { useWebSocket } from "@/lib/websocket-service";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

/**
 * Component to display WebSocket connection status
 */
export function WebSocketStatus() {
  const { isConnected, subscribe } = useWebSocket();
  const [hasMessages, setHasMessages] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  
  // Subscribe to all WebSocket events
  useEffect(() => {
    // Track message receipt
    const unsubscribe = subscribe('all', () => {
      setHasMessages(true);
      setEventCount(prev => prev + 1);
    });
    
    return unsubscribe;
  }, [subscribe]);
  
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className="rounded-full transition-colors px-2 py-0.5 text-xs"
      >
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
      {hasMessages && (
        <Badge 
          variant="outline" 
          className="rounded-full px-2 py-0.5 text-xs"
        >
          {eventCount} event{eventCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}