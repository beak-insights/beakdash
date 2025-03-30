import { create } from 'zustand';
import { Dashboard, InsertDashboard } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface DashboardState {
  dashboards: Dashboard[];
  loading: boolean;
  error: string | null;
  activeDashboard: Dashboard | null;
  
  // Actions
  fetchDashboards: () => Promise<void>;
  getDashboard: (id: number) => Promise<Dashboard | null>;
  createDashboard: (dashboard: InsertDashboard) => Promise<Dashboard>;
  updateDashboard: (id: number, dashboard: Partial<Dashboard>) => Promise<Dashboard>;
  deleteDashboard: (id: number) => Promise<void>;
  setActiveDashboard: (dashboard: Dashboard | null) => void;
  updateDashboardLayout: (id: number, layout: any) => Promise<Dashboard>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: [],
  loading: false,
  error: null,
  activeDashboard: null,
  
  fetchDashboards: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/dashboards');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboards');
      }
      const data = await response.json();
      set({ 
        dashboards: data, 
        loading: false,
        // If no active dashboard is set, set the first one as active
        activeDashboard: get().activeDashboard || (data.length > 0 ? data[0] : null)
      });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  getDashboard: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/dashboards/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
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
  
  createDashboard: async (dashboard: InsertDashboard) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/dashboards', dashboard);
      const newDashboard = response as Dashboard;
      set(state => ({ 
        dashboards: [...state.dashboards, newDashboard],
        loading: false,
        // Set new dashboard as active
        activeDashboard: newDashboard
      }));
      return newDashboard;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  updateDashboard: async (id: number, dashboard: Partial<Dashboard>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest('PUT', `/api/dashboards/${id}`, dashboard);
      const updatedDashboard = response as Dashboard;
      set(state => ({
        dashboards: state.dashboards.map(d => 
          d.id === id ? updatedDashboard : d
        ),
        loading: false,
        activeDashboard: state.activeDashboard?.id === id 
          ? updatedDashboard 
          : state.activeDashboard
      }));
      return updatedDashboard;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  deleteDashboard: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiRequest('DELETE', `/api/dashboards/${id}`);
      set(state => {
        const filteredDashboards = state.dashboards.filter(d => d.id !== id);
        return {
          dashboards: filteredDashboards,
          loading: false,
          // If active dashboard was deleted, set a new active dashboard
          activeDashboard: state.activeDashboard?.id === id 
            ? (filteredDashboards.length > 0 ? filteredDashboards[0] : null)
            : state.activeDashboard
        };
      });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  setActiveDashboard: (dashboard: Dashboard | null) => {
    set({ activeDashboard: dashboard });
  },
  
  updateDashboardLayout: async (id: number, layout: any) => {
    try {
      const currentDashboard = await get().getDashboard(id);
      if (!currentDashboard) {
        throw new Error('Dashboard not found');
      }
      
      const updatedDashboard = await get().updateDashboard(id, {
        layout: layout
      });
      
      return updatedDashboard;
    } catch (error) {
      throw error;
    }
  }
}));
