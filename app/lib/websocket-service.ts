import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/lib/hooks/use-toast';

// Type for event listeners
type EventListener = (data: any) => void;

// WebSocket connection states
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// The websocket service context
export interface WebSocketContextType {
  status: WebSocketStatus;
  lastMessage: any | null;
  sendMessage: (type: string, payload: any) => void;
  subscribe: (eventType: string, callback: EventListener) => () => void;
  switchSpace: (userId: number, spaceId: number) => void;
}

/**
 * React hook for working with WebSockets
 */
export function useWebSocket(): WebSocketContextType {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const { toast } = useToast();
  
  // Store event listeners in a ref to avoid re-creates on each render
  const eventListeners = useRef<Map<string, Set<EventListener>>>(new Map());
  
  // Connection retry logic
  const retryCount = useRef(0);
  const maxRetries = 5;
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Reconnection delay with exponential backoff
  const getRetryDelay = () => Math.min(1000 * (2 ** retryCount.current), 30000);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      // Initialize the WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      
      // Connection opened
      ws.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setStatus('connected');
        retryCount.current = 0; // Reset retry count on successful connection
        
        // Send authentication message if user is logged in
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          ws.send(JSON.stringify({
            type: 'auth',
            payload: { token: authToken }
          }));
        }
      });
      
      // Connection closed
      ws.addEventListener('close', (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        setStatus('disconnected');
        setSocket(null);
        
        // Attempt to reconnect unless this was a clean close
        if (!event.wasClean && retryCount.current < maxRetries) {
          const delay = getRetryDelay();
          console.log(`Attempting to reconnect in ${delay}ms (retry ${retryCount.current + 1}/${maxRetries})`);
          setStatus('reconnecting');
          
          // Clear any existing retry timeout
          if (retryTimeout.current) {
            clearTimeout(retryTimeout.current);
          }
          
          // Set up the retry
          retryTimeout.current = setTimeout(() => {
            retryCount.current += 1;
            connect();
          }, delay);
        } else if (retryCount.current >= maxRetries) {
          setStatus('error');
          toast({
            title: 'Connection Failed',
            description: 'Could not connect to the server after multiple attempts.',
            variant: 'destructive',
          });
        }
      });
      
      // Connection error
      ws.addEventListener('error', (error) => {
        console.error('WebSocket connection error:', error);
        setStatus('error');
      });
      
      // Listen for messages
      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Dispatch to relevant listeners
          if (data && data.type) {
            const listeners = eventListeners.current.get(data.type);
            if (listeners) {
              listeners.forEach(listener => {
                try {
                  listener(data.payload || data);
                } catch (err) {
                  console.error(`Error in listener for event ${data.type}:`, err);
                }
              });
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      setSocket(ws);
      return ws;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setStatus('error');
      return null;
    }
  }, [toast]);
  
  // Connect on component mount
  useEffect(() => {
    const ws = connect();
    
    // Clean up on unmount
    return () => {
      if (ws) {
        ws.close();
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [connect]);
  
  // Subscribe to an event type
  const subscribe = useCallback((eventType: string, callback: EventListener): (() => void) => {
    // Initialize the set of listeners for this event type if it doesn't exist
    if (!eventListeners.current.has(eventType)) {
      eventListeners.current.set(eventType, new Set());
    }
    
    // Add this listener to the set
    const listeners = eventListeners.current.get(eventType)!;
    listeners.add(callback);
    
    // Return an unsubscribe function
    return () => {
      const listeners = eventListeners.current.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          eventListeners.current.delete(eventType);
        }
      }
    };
  }, []);
  
  // Send a message to the server
  const sendMessage = useCallback((type: string, payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
      toast({
        title: 'Connection Issue',
        description: 'Cannot send message: Not connected to server',
        variant: 'destructive',
      });
    }
  }, [socket, toast]);
  
  // Space switching functionality
  const switchSpace = useCallback((userId: number, spaceId: number) => {
    sendMessage('switch_space', { userId, spaceId });
  }, [sendMessage]);
  
  return {
    status,
    lastMessage,
    sendMessage,
    subscribe,
    switchSpace,
  };
}