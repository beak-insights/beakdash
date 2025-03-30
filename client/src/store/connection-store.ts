import { create } from 'zustand';
import { Connection, InsertConnection } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface ConnectionState {
  connections: Connection[];
  loading: boolean;
  error: string | null;
  selectedConnection: Connection | null;
  
  // Actions
  fetchConnections: () => Promise<void>;
  getConnection: (id: number) => Promise<Connection | null>;
  createConnection: (connection: InsertConnection) => Promise<Connection>;
  updateConnection: (id: number, connection: Partial<Connection>) => Promise<Connection>;
  deleteConnection: (id: number) => Promise<void>;
  setSelectedConnection: (connection: Connection | null) => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  loading: false,
  error: null,
  selectedConnection: null,
  
  fetchConnections: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/connections');
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      const data = await response.json();
      set({ connections: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  getConnection: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/connections/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch connection');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  createConnection: async (connection: InsertConnection) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/connections', connection);
      const newConnection = response as Connection;
      set(state => ({ 
        connections: [...state.connections, newConnection],
        loading: false 
      }));
      return newConnection;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  updateConnection: async (id: number, connection: Partial<Connection>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest('PUT', `/api/connections/${id}`, connection);
      const updatedConnection = response as Connection;
      set(state => ({
        connections: state.connections.map(c => 
          c.id === id ? updatedConnection : c
        ),
        loading: false,
        selectedConnection: get().selectedConnection?.id === id 
          ? updatedConnection 
          : get().selectedConnection
      }));
      return updatedConnection;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  deleteConnection: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiRequest('DELETE', `/api/connections/${id}`);
      set(state => ({
        connections: state.connections.filter(c => c.id !== id),
        loading: false,
        selectedConnection: state.selectedConnection?.id === id 
          ? null 
          : state.selectedConnection
      }));
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  setSelectedConnection: (connection: Connection | null) => {
    set({ selectedConnection: connection });
  }
}));
