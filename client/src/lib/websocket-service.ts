/**
 * WebSocket service for real-time communication
 */

// Event types
export type WebSocketEvent = 
  | { type: 'connection', message: string, timestamp: string }
  | { type: 'echo', data: any, timestamp: string }
  | { type: 'error', message: string, timestamp: string }
  | { type: 'data-update', dataset: string, data: any, timestamp: string };

export type WebSocketEventHandler = (event: WebSocketEvent) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private eventListeners: Map<string, WebSocketEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Close existing socket if one exists
        if (this.socket) {
          this.socket.close();
        }
        
        // Create new WebSocket connection with the correct protocol and path
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        this.socket = new WebSocket(wsUrl);
        
        // Setup event handlers
        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.socket.onclose = (event) => {
          console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
          this.socket = null;
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
    
    console.log(`Attempting to reconnect in ${delay / 1000} seconds (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(() => {
        // If reconnect fails and we haven't reached max attempts, try again
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      });
    }, delay);
  }
  
  /**
   * Send a message to the WebSocket server
   */
  send(data: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }
  
  /**
   * Close the WebSocket connection
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Normal closure');
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  /**
   * Subscribe to WebSocket events
   */
  subscribe(eventType: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    const handlers = this.eventListeners.get(eventType)!;
    handlers.push(handler);
    
    // Return an unsubscribe function
    return () => {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    if (!data || !data.type) {
      console.error('Invalid WebSocket message format:', data);
      return;
    }
    
    // Notify all handlers for this event type
    const handlers = this.eventListeners.get(data.type) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in WebSocket event handler for type "${data.type}":`, error);
      }
    });
    
    // Also notify 'all' event handlers
    const allHandlers = this.eventListeners.get('all') || [];
    allHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in WebSocket 'all' event handler for type "${data.type}":`, error);
      }
    });
  }
  
  /**
   * Check if the WebSocket connection is currently open
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create and export a singleton instance
export const webSocketService = new WebSocketService();

// Export React hook for using the WebSocket service
import { useEffect, useState } from 'react';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected());
  
  useEffect(() => {
    // Connect to the WebSocket server when the component mounts
    if (!webSocketService.isConnected()) {
      webSocketService.connect().catch(error => {
        console.error('Failed to connect to WebSocket server:', error);
      });
    }
    
    // Subscribe to connection events
    const connectionHandler = () => {
      setIsConnected(webSocketService.isConnected());
    };
    
    const unsubscribeConnection = webSocketService.subscribe('connection', connectionHandler);
    
    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(webSocketService.isConnected());
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      unsubscribeConnection();
      clearInterval(interval);
    };
  }, []);
  
  return {
    isConnected,
    send: webSocketService.send.bind(webSocketService),
    subscribe: webSocketService.subscribe.bind(webSocketService),
    connect: webSocketService.connect.bind(webSocketService),
    disconnect: webSocketService.disconnect.bind(webSocketService)
  };
}