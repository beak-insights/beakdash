import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICopilotState {
  messages: Message[];
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  addMessage: (message: Message) => void;
  toggleOpen: () => void;
  toggleMinimized: () => void;
  setOpen: (isOpen: boolean) => void;
  setMinimized: (isMinimized: boolean) => void;
  generateChartSuggestion: (datasetId: number) => Promise<any>;
}

export const useAICopilotStore = create<AICopilotState>((set, get) => ({
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI Copilot. How can I help you with your dashboard today?",
      timestamp: new Date(),
    }
  ],
  isOpen: false,
  isMinimized: false,
  isLoading: false,
  error: null,
  
  sendMessage: async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    get().addMessage(userMessage);
    
    set({ isLoading: true });
    
    try {
      // Get last 5 messages for context
      const context = get().messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      // Send to AI API
      const response = await apiRequest('POST', '/api/ai/copilot', {
        prompt: content,
        context
      });
      
      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.response || "I couldn't process that request.",
        timestamp: new Date(response.timestamp) || new Date()
      };
      
      get().addMessage(aiMessage);
      set({ isLoading: false, error: null });
    } catch (error) {
      // For demo purposes, add a fallback message
      const fallbackMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "I'm currently in demo mode. In the full version, I'd analyze your data and help with chart suggestions, data insights, and dashboard configuration.",
        timestamp: new Date()
      };
      
      get().addMessage(fallbackMessage);
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },
  
  clearMessages: () => {
    set({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your AI Copilot. How can I help you with your dashboard today?",
          timestamp: new Date(),
        }
      ]
    });
  },
  
  addMessage: (message: Message) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },
  
  toggleOpen: () => {
    set(state => ({ 
      isOpen: !state.isOpen,
      isMinimized: false // When toggling open, ensure it's not minimized
    }));
  },
  
  toggleMinimized: () => {
    set(state => ({ isMinimized: !state.isMinimized }));
  },
  
  setOpen: (isOpen: boolean) => {
    set({ isOpen });
  },
  
  setMinimized: (isMinimized: boolean) => {
    set({ isMinimized });
  },
  
  generateChartSuggestion: async (datasetId: number) => {
    set({ isLoading: true });
    
    try {
      // Get dataset data
      const response = await fetch(`/api/datasets/${datasetId}/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch dataset data');
      }
      
      const data = await response.json();
      
      // Send to AI API for chart suggestion
      const suggestion = await apiRequest('POST', '/api/ai/copilot/chart-suggestion', {
        datasetId,
        sampleData: data.slice(0, 5) // Send first 5 rows as sample
      });
      
      set({ isLoading: false });
      return suggestion;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
      
      // Return fallback suggestion for demo
      return {
        chartType: "bar",
        config: {
          xAxis: "month",
          yAxis: "sales",
          title: "Monthly Sales Analysis"
        },
        reasoning: "Bar charts are effective for comparing discrete categories. I've selected 'month' for the x-axis and 'sales' for the y-axis to show monthly sales performance."
      };
    }
  }
}));
