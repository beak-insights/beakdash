import { create } from 'zustand';
import { Dataset, InsertDataset } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface DatasetState {
  datasets: Dataset[];
  loading: boolean;
  error: string | null;
  selectedDataset: Dataset | null;
  datasetData: Record<number, any[]>; // To store fetched data for each dataset
  
  // Actions
  fetchDatasets: () => Promise<void>;
  getDataset: (id: number) => Promise<Dataset | null>;
  createDataset: (dataset: InsertDataset) => Promise<Dataset>;
  updateDataset: (id: number, dataset: Partial<Dataset>) => Promise<Dataset>;
  deleteDataset: (id: number) => Promise<void>;
  setSelectedDataset: (dataset: Dataset | null) => void;
  fetchDatasetData: (id: number) => Promise<any[]>;
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  datasets: [],
  loading: false,
  error: null,
  selectedDataset: null,
  datasetData: {},
  
  fetchDatasets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/datasets');
      if (!response.ok) {
        throw new Error('Failed to fetch datasets');
      }
      const data = await response.json();
      set({ datasets: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
  
  getDataset: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/datasets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dataset');
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
  
  createDataset: async (dataset: InsertDataset) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest('POST', '/api/datasets', dataset);
      const newDataset = response as Dataset;
      set(state => ({ 
        datasets: [...state.datasets, newDataset],
        loading: false 
      }));
      return newDataset;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  updateDataset: async (id: number, dataset: Partial<Dataset>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest('PUT', `/api/datasets/${id}`, dataset);
      const updatedDataset = response as Dataset;
      set(state => ({
        datasets: state.datasets.map(d => 
          d.id === id ? updatedDataset : d
        ),
        loading: false,
        selectedDataset: state.selectedDataset?.id === id 
          ? updatedDataset 
          : state.selectedDataset
      }));
      return updatedDataset;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  deleteDataset: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiRequest('DELETE', `/api/datasets/${id}`);
      set(state => ({
        datasets: state.datasets.filter(d => d.id !== id),
        loading: false,
        selectedDataset: state.selectedDataset?.id === id 
          ? null 
          : state.selectedDataset,
        datasetData: (() => {
          const newDatasetData = { ...state.datasetData };
          delete newDatasetData[id];
          return newDatasetData;
        })()
      }));
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  
  setSelectedDataset: (dataset: Dataset | null) => {
    set({ selectedDataset: dataset });
  },
  
  fetchDatasetData: async (id: number) => {
    // If we already have this data cached, return it
    if (get().datasetData[id]) {
      return get().datasetData[id];
    }
    
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/datasets/${id}/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch dataset data');
      }
      const data = await response.json();
      
      // Cache the data
      set(state => ({
        datasetData: {
          ...state.datasetData,
          [id]: data
        },
        loading: false
      }));
      
      return data;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      
      // For demo purposes, return sample data
      const sampleData = getSampleData();
      set(state => ({
        datasetData: {
          ...state.datasetData,
          [id]: sampleData
        }
      }));
      
      return sampleData;
    }
  }
}));

// Helper function to generate sample data for demo
function getSampleData() {
  return [
    { month: "Jan", region: "North", sales: 120, revenue: 12450, profit: 4320 },
    { month: "Jan", region: "South", sales: 95, revenue: 9820, profit: 3150 },
    { month: "Feb", region: "North", sales: 145, revenue: 15230, profit: 5450 },
    { month: "Feb", region: "South", sales: 110, revenue: 11500, profit: 3900 },
    { month: "Mar", region: "North", sales: 170, revenue: 17800, profit: 6200 },
    { month: "Mar", region: "South", sales: 125, revenue: 13100, profit: 4500 },
    { month: "Apr", region: "North", sales: 110, revenue: 11400, profit: 3800 },
    { month: "Apr", region: "South", sales: 130, revenue: 13500, profit: 4650 },
    { month: "May", region: "North", sales: 180, revenue: 18700, profit: 6500 },
    { month: "May", region: "South", sales: 115, revenue: 12000, profit: 4100 },
  ];
}
