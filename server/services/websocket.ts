import { WebSocket } from 'ws';
import { Space } from '@shared/schema';
import { storage } from '../storage';

// Extended WebSocket interface with additional properties
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: number;
  spaceId?: number;
}

// Global collection of connected clients
const clients: Set<ExtendedWebSocket> = new Set();

/**
 * Broadcast a message to all connected WebSocket clients with error handling
 */
export function broadcastWebSocketMessage(message: any): void {
  const messageString = JSON.stringify(message);
  
  clients.forEach(client => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    } catch (error) {
      console.error("Error broadcasting WebSocket message:", error);
    }
  });
}

/**
 * Send a message to a specific user
 */
export function sendMessageToUser(userId: number, message: any): boolean {
  const messageString = JSON.stringify(message);
  let messageSent = false;
  
  clients.forEach(client => {
    if (client.userId === userId && client.readyState === WebSocket.OPEN) {
      try {
        client.send(messageString);
        messageSent = true;
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
      }
    }
  });
  
  return messageSent;
}

/**
 * Register a WebSocket client with validation
 */
export function registerWebSocketClient(client: ExtendedWebSocket): void {
  if (client && client.readyState === WebSocket.OPEN) {
    clients.add(client);
    console.log(`WebSocket client registered. Total clients: ${clients.size}`);
  }
}

/**
 * Unregister a WebSocket client with error handling
 */
export function unregisterWebSocketClient(client: ExtendedWebSocket): void {
  try {
    clients.delete(client);
    console.log(`WebSocket client unregistered. Remaining clients: ${clients.size}`);
  } catch (error) {
    console.error("Error unregistering WebSocket client:", error);
  }
}

/**
 * Handle space switching via WebSocket
 */
export async function handleSpaceSwitch(userId: number, spaceId: number): Promise<void> {
  try {
    // Verify the user has access to this space
    const isUserInSpace = await storage.isUserInSpace(userId, spaceId);
    
    if (!isUserInSpace) {
      // User doesn't have access to this space
      sendMessageToUser(userId, {
        type: 'space_switch_error',
        message: 'You do not have access to this space',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Get space details
    const space = await storage.getSpace(spaceId);
    
    if (!space) {
      sendMessageToUser(userId, {
        type: 'space_switch_error',
        message: 'Space not found',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Associate the user with this space in active WebSocket connections
    let userHasConnection = false;
    
    clients.forEach(client => {
      if (client.userId === userId && client.readyState === WebSocket.OPEN) {
        client.spaceId = spaceId;
        userHasConnection = true;
        
        // Send success message
        try {
          client.send(JSON.stringify({
            type: 'space_switch_success',
            space,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error(`Error sending space switch confirmation to user ${userId}:`, error);
        }
      }
    });
    
    if (!userHasConnection) {
      console.warn(`No active WebSocket connection found for user ${userId}`);
    }
    
  } catch (error) {
    console.error(`Error handling space switch for user ${userId} to space ${spaceId}:`, error);
    sendMessageToUser(userId, {
      type: 'space_switch_error',
      message: 'An error occurred while switching spaces',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Process WebSocket messages
 */
export function processWebSocketMessage(socket: ExtendedWebSocket, message: string): void {
  try {
    const data = JSON.parse(message);
    
    // Handle different message types
    switch (data.type) {
      case 'switch_space':
        if (data.userId && data.spaceId) {
          // Set userId on the socket for future reference
          socket.userId = data.userId;
          handleSpaceSwitch(data.userId, data.spaceId);
        }
        break;
        
      case 'ping':
        // Respond to ping with pong
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
        }
        break;
        
      case 'user_identify':
        // Set user ID on the socket
        if (data.userId) {
          socket.userId = data.userId;
          console.log(`WebSocket client identified as user ${data.userId}`);
        }
        break;
        
      // Add other message types as needed
        
      default:
        console.log(`Unhandled WebSocket message type: ${data.type}`);
    }
  } catch (error) {
    console.error("Error processing WebSocket message:", error);
  }
}

/**
 * Get all clients for a specific space
 */
export function getSpaceClients(spaceId: number): ExtendedWebSocket[] {
  return Array.from(clients).filter(client => client.spaceId === spaceId);
}

/**
 * Broadcast a message to all clients in a specific space
 */
export function broadcastToSpace(spaceId: number, message: any): void {
  const messageString = JSON.stringify(message);
  const spaceClients = getSpaceClients(spaceId);
  
  spaceClients.forEach(client => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    } catch (error) {
      console.error(`Error broadcasting to space ${spaceId}:`, error);
    }
  });
}

/**
 * Keep track of WebSocket connections and clean up dead connections
 */
export function startWebSocketHeartbeat(interval = 30000): NodeJS.Timeout {
  const heartbeatInterval = setInterval(() => {
    clients.forEach(socket => {
      if (socket.isAlive === false) {
        socket.terminate();
        unregisterWebSocketClient(socket);
        return;
      }
      
      socket.isAlive = false;
      try {
        socket.ping();
      } catch (error) {
        console.error("Error sending ping:", error);
        socket.terminate();
        unregisterWebSocketClient(socket);
      }
    });
  }, interval);
  
  return heartbeatInterval;
}