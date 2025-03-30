import { create } from 'zustand';
import { Widget, InsertWidget } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface WidgetState {
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  editingWidget: Widget | null;
  
  // Actions
  fetchWidgets: (dashboardId?: number) => Promise<void>;
  getWidget: (id: number) => Promise<Widget | null>;
  createWidget: (widget: InsertWidget) => Promise<Widget>;
  updateWidget: (id: number, widget: Partial<Widget>) => Promise<Widget>;
  deleteWidget: (id: number) => Promise<void>;
  setEditingWidget: (widget: Widget | null) => void;
  updateWidgetPositions: (widgets: { id: number, position: any }[]) => Promise<void>;
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  widgets: [],
  loading: false,
  error: null,
  editingWidget: null,
  
  fetchWidgets: async (dashboardId?: number) => {
    set({ loading: true, error: null });
    try {
      const url = dashboardId 
        ? `/api/widgets?dashboardId=${dashboardId}` 
        : '/api/widgets';
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch widgets');
      }
      const data = await response.json();
      set({ widgets: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  getWidget: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/widgets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch widget');
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
  
  createWidget: async (widget: InsertWidget) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/widgets', widget);
      const newWidget = response as Widget;
      set(state => ({ 
        widgets: [...state.widgets, newWidget],
        loading: false 
      }));
      return newWidget;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  updateWidget: async (id: number, widget: Partial<Widget>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest('PUT', `/api/widgets/${id}`, widget);
      const updatedWidget = response as Widget;
      set(state => ({
        widgets: state.widgets.map(w => 
          w.id === id ? updatedWidget : w
        ),
        loading: false,
        editingWidget: state.editingWidget?.id === id 
          ? updatedWidget 
          : state.editingWidget
      }));
      return updatedWidget;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  deleteWidget: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiRequest('DELETE', `/api/widgets/${id}`);
      set(state => ({
        widgets: state.widgets.filter(w => w.id !== id),
        loading: false,
        editingWidget: state.editingWidget?.id === id 
          ? null 
          : state.editingWidget
      }));
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  setEditingWidget: (widget: Widget | null) => {
    set({ editingWidget: widget });
  },
  
  updateWidgetPositions: async (widgets: { id: number, position: any }[]) => {
    set({ loading: true, error: null });
    try {
      // Bulk update widget positions
      const updatePromises = widgets.map(w => 
        get().updateWidget(w.id, { position: w.position })
      );
      
      await Promise.all(updatePromises);
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  }
}));
