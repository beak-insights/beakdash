import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from './auth-provider';

// Define WebSocket message types
interface WebSocketMessage {
  type: string;
  payload: any;
}

// Define WebSocketContextType
interface WebSocketContextType {
  connected: boolean;
  send: (message: WebSocketMessage) => void;
  messages: WebSocketMessage[];
}

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Define WebSocketProviderProps
interface WebSocketProviderProps {
  children: ReactNode;
}

// WebSocketProvider component
export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  // Reconnect timer
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket server
  const connectWebSocket = () => {
    // Get WebSocket URL from environment or use default
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}/ws`;
    
    try {
      // Close existing connection if it exists
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      
      // Create new WebSocket connection
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;
      
      // Configure WebSocket event handlers
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        
        // Clear reconnect timer if it exists
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        
        // Send authentication message if user is logged in
        if (user) {
          send({
            type: 'auth',
            payload: {
              userId: user.id,
            },
          });
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Set reconnect timer if it doesn't exist
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            console.log('Reconnecting WebSocket...');
            connectWebSocket();
          }, 5000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onmessage = (event) => {
        try {
          // Parse message data
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          // Add message to messages array
          setMessages((prev) => [...prev, message]);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket server:', error);
    }
  };

  // Send message to WebSocket server
  const send = (message: WebSocketMessage) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  };

  // Connect on component mount
  useEffect(() => {
    connectWebSocket();
    
    // Clean up on component unmount
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);

  // Reconnect when user changes
  useEffect(() => {
    if (connected && user) {
      send({
        type: 'auth',
        payload: {
          userId: user.id,
        },
      });
    }
  }, [user, connected]);

  // Create context value
  const value: WebSocketContextType = {
    connected,
    send,
    messages,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
};