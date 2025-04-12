import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWebSocket } from "@/lib/websocket-service";
import { WifiIcon, WifiOff } from "lucide-react";

/**
 * Component to display WebSocket connection status
 */
export function WebSocketStatus() {
  const { isConnected, lastPing } = useWebSocket();
  const [latency, setLatency] = useState<number | null>(null);
  
  // Calculate latency every time we get a ping
  useEffect(() => {
    if (lastPing && lastPing.sent && lastPing.received) {
      const pingLatency = lastPing.received - lastPing.sent;
      setLatency(pingLatency);
    }
  }, [lastPing]);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isConnected ? "outline" : "destructive"} 
            className={`flex items-center gap-1 ${isConnected ? "hover:bg-green-50" : "hover:bg-red-50"}`}
          >
            {isConnected ? (
              <>
                <WifiIcon className="h-3 w-3 text-green-500" /> 
                <span className="text-xs">
                  Connected {latency !== null && `(${latency}ms)`}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" /> 
                <span className="text-xs">Offline</span>
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isConnected 
              ? `WebSocket connection is active ${latency !== null ? `with ${latency}ms latency` : ''}` 
              : "WebSocket connection is offline. Real-time updates are not available."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}