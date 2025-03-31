import { useState, useEffect, useCallback, useMemo } from 'react';
import { create } from 'zustand';

// Define types for websocket events
export type WebSocketEvent = {
  type: string;
  message?: string;
  timestamp: string;
  [key: string]: any;
};

type WebSocketState = {
  isConnected: boolean;
  socket: WebSocket | null;
  lastPing: { sent: number; received: number } | null;
  reconnectAttempt: number;
  eventListeners: Map<string, Set<(event: WebSocketEvent) => void>>;
  connect: () => void;
  disconnect: () => void;
  resetReconnectAttempt: () => void;
  setSocket: (socket: WebSocket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setLastPing: (ping: { sent: number; received: number } | null) => void;
  incrementReconnectAttempt: () => void;
  addEventListenerToSet: (type: string, callback: (event: WebSocketEvent) => void) => void;
  removeEventListenerFromSet: (type: string, callback: (event: WebSocketEvent) => void) => void;
};

// Create a store to manage WebSocket state
const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  socket: null,
  lastPing: null,
  reconnectAttempt: 0,
  eventListeners: new Map(),
  
  connect: () => {
    const { socket } = get();
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    try {
      // Create a more robust WebSocket URL
      const isSecure = window.location.protocol === 'https:';
      const protocol = isSecure ? 'wss:' : 'ws:';
      
      // Get the host from the current URL or default to localhost for development
      const host = window.location.host || 'localhost:5000';
      
      // Ensure the WebSocket path is correctly formatted
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log(`Connecting to WebSocket at: ${wsUrl}`);
      
      // Create the WebSocket connection with specific options
      const newSocket = new WebSocket(wsUrl);
      
      // Set a connection timeout to prevent hanging connections
      const connectionTimeout = setTimeout(() => {
        if (newSocket.readyState !== WebSocket.OPEN) {
          console.warn('WebSocket connection timeout, closing socket');
          newSocket.close();
          set({ isConnected: false });
        }
      }, 10000); // 10 second timeout
      
      // Clear the timeout once connected
      newSocket.addEventListener('open', () => {
        clearTimeout(connectionTimeout);
      });
      
      set({ socket: newSocket });
      
      // Socket event handlers are set up in the useWebSocket hook
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      set({ isConnected: false });
    }
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },
  
  resetReconnectAttempt: () => set({ reconnectAttempt: 0 }),
  
  setSocket: (socket) => set({ socket }),
  
  setIsConnected: (isConnected) => set({ isConnected }),
  
  setLastPing: (ping) => set({ lastPing: ping }),
  
  incrementReconnectAttempt: () => set((state) => ({ reconnectAttempt: state.reconnectAttempt + 1 })),
  
  addEventListenerToSet: (type, callback) => {
    set((state) => {
      const listeners = state.eventListeners;
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type)?.add(callback);
      return { eventListeners: new Map(listeners) };
    });
  },
  
  removeEventListenerFromSet: (type, callback) => {
    set((state) => {
      const listeners = state.eventListeners;
      if (listeners.has(type)) {
        const typeListeners = listeners.get(type);
        if (typeListeners) {
          typeListeners.delete(callback);
          if (typeListeners.size === 0) {
            listeners.delete(type);
          }
        }
      }
      return { eventListeners: new Map(listeners) };
    });
  },
}));

// The maximum time to wait before trying to reconnect
const MAX_RECONNECT_TIME = 30000; // 30 seconds

/**
 * Hook for websocket functionality
 */
export function useWebSocket() {
  const { 
    isConnected, 
    socket, 
    lastPing,
    reconnectAttempt,
    connect, 
    disconnect, 
    resetReconnectAttempt,
    setIsConnected,
    setLastPing,
    incrementReconnectAttempt,
    addEventListenerToSet,
    removeEventListenerFromSet,
    eventListeners
  } = useWebSocketStore();
  
  // Effect for socket setup and event handling
  useEffect(() => {
    // If no socket exists, establish connection
    if (!socket) {
      connect();
      return;
    }
    
    const handleOpen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      resetReconnectAttempt();
      
      // Start ping loop
      const pingInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          const pingTime = Date.now();
          socket.send(JSON.stringify({ type: 'ping', timestamp: pingTime }));
          
          // Store the sent time for the ping
          setLastPing(lastPing ? { ...lastPing, sent: pingTime } : { sent: pingTime, received: 0 });
        }
      }, 10000); // Ping every 10 seconds
      
      return () => clearInterval(pingInterval);
    };
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WebSocketEvent;
        
        // Handle pong responses
        if (data.type === 'pong') {
          setLastPing(lastPing ? { ...lastPing, received: Date.now() } : { sent: 0, received: Date.now() });
        }
        
        // Notify all listeners for this event type
        const listeners = eventListeners.get(data.type);
        if (listeners) {
          listeners.forEach(callback => callback(data));
        }
        
        // Notify 'all' listeners for all events
        const allListeners = eventListeners.get('all');
        if (allListeners) {
          allListeners.forEach(callback => callback(data));
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
    
    const handleClose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect with exponential backoff
      incrementReconnectAttempt();
      const reconnectTime = Math.min(1000 * Math.pow(2, reconnectAttempt), MAX_RECONNECT_TIME);
      
      console.log(`Attempting to reconnect in ${reconnectTime}ms`);
      const reconnectTimeout = setTimeout(() => {
        connect();
      }, reconnectTime);
      
      return () => clearTimeout(reconnectTimeout);
    };
    
    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    // Add event listeners
    socket.addEventListener('open', handleOpen);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);
    
    // Clean up on unmount
    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('error', handleError);
    };
  }, [
    socket, 
    connect, 
    setIsConnected, 
    resetReconnectAttempt, 
    incrementReconnectAttempt, 
    reconnectAttempt,
    setLastPing,
    lastPing,
    eventListeners
  ]);
  
  // Subscribe to events
  const subscribe = useCallback((type: string, callback: (event: WebSocketEvent) => void) => {
    addEventListenerToSet(type, callback);
    
    // Return unsubscribe function
    return () => {
      removeEventListenerFromSet(type, callback);
    };
  }, [addEventListenerToSet, removeEventListenerFromSet]);
  
  // Send message to websocket with improved error handling
  const send = useCallback((message: any) => {
    if (!socket) {
      console.warn('WebSocket not initialized, attempting to reconnect');
      connect();
      return false;
    }
    
    if (socket.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket is connecting, will retry sending message');
      // Queue the message to be sent when connection is established
      setTimeout(() => send(message), 1000);
      return true;
    }
    
    if (socket.readyState === WebSocket.OPEN) {
      try {
        const serializedMessage = JSON.stringify(message);
        socket.send(serializedMessage);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else if (socket.readyState === WebSocket.CLOSING || socket.readyState === WebSocket.CLOSED) {
      console.warn('WebSocket is closed or closing, attempting to reconnect');
      connect();
      return false;
    }
    
    return false;
  }, [socket, connect]);
  
  return useMemo(() => ({
    isConnected,
    lastPing,
    connect,
    disconnect,
    subscribe,
    send
  }), [isConnected, lastPing, connect, disconnect, subscribe, send]);
}