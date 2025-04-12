import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  send: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // Function to establish WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Don't attempt to connect in SSR/initial render
    if (typeof window === 'undefined') return;
    
    // Determine the WebSocket URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/ws`;
    
    setConnectionStatus('connecting');
    
    try {
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        setReconnectAttempts(0);
        console.log('WebSocket connection established');
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(data);
          
          // Handle different message types here if needed
          if (data.type === 'error') {
            setError(data.payload.message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      newSocket.onerror = (err) => {
        console.error('WebSocket error:', err);
        setConnectionStatus('error');
        setError('WebSocket connection error');
      };
      
      newSocket.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        console.log('WebSocket connection closed');
        
        // Attempt to reconnect if not at max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts((prev) => prev + 1);
          setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
        } else {
          setError('Maximum reconnection attempts reached');
        }
      };
      
      setSocket(newSocket);
      
      // Clean up function
      return () => {
        newSocket.close();
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setConnectionStatus('error');
      setError('Failed to create WebSocket connection');
    }
  }, [reconnectAttempts]);

  // Connect WebSocket on mount
  useEffect(() => {
    const cleanup = connectWebSocket();
    
    // Clean up on unmount
    return () => {
      if (cleanup) cleanup();
      if (socket) socket.close();
    };
  }, [connectWebSocket]);

  // Function to send messages through WebSocket
  const send = useCallback((message: WebSocketMessage) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, [socket, isConnected]);

  const value = {
    isConnected,
    send,
    lastMessage,
    connectionStatus,
    error,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};