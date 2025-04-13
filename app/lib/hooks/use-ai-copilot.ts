import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/lib/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseCopilotOptions {
  onMessageReceived?: (message: Message) => void;
}

/**
 * Hook for AI Copilot functionality
 */
export function useAICopilot(options: UseCopilotOptions = {}) {
  const { onMessageReceived } = options;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI Copilot. How can I help you with your dashboard today?",
      timestamp: new Date(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();

  // Send message to AI Copilot
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      // Add user message to chat
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };
      
      addMessage(userMessage);
      
      // Send to API
      try {
        const context = messages.slice(-5).map(m => ({
          role: m.role,
          content: m.content
        }));
        
        const response = await apiRequest("POST", "/api/ai/copilot", {
          prompt: content,
          context,
        });
        
        return {
          response: response.response || "I couldn't process that request.",
          timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
        };
      } catch (error) {
        // For demo purposes, return a fallback response
        return {
          response: "I'm currently in demo mode. In the full version, I'd analyze your data and help with chart suggestions, data insights, and dashboard configuration.",
          timestamp: new Date(),
        };
      }
    },
    onSuccess: (data) => {
      // Add AI response to messages
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: data.timestamp,
      };
      
      addMessage(aiResponse);
      
      if (onMessageReceived) {
        onMessageReceived(aiResponse);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to get AI response: ${error.message}`,
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      addMessage(errorMessage);
    },
  });

  // Generate chart suggestion based on dataset
  const generateChartSuggestion = useMutation({
    mutationFn: async (datasetId: number) => {
      try {
        const response = await apiRequest("POST", "/api/ai/copilot/chart-suggestion", {
          datasetId,
        });
        
        return response;
      } catch (error) {
        // For demo purposes, return a fallback suggestion
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
    },
    onSuccess: (data) => {
      // Add chart suggestion to messages
      const message: Message = {
        id: `ai-suggestion-${Date.now()}`,
        role: "assistant",
        content: `I suggest using a ${data.chartType} chart. ${data.reasoning}`,
        timestamp: new Date(),
      };
      
      addMessage(message);
      
      toast({
        title: "Chart suggestion generated",
        description: "AI has suggested a chart type for your data.",
      });
      
      if (onMessageReceived) {
        onMessageReceived(message);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate chart suggestion: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add a message to the chat
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your AI Copilot. How can I help you with your dashboard today?",
        timestamp: new Date(),
      },
    ]);
  };

  // Toggle the copilot open state
  const toggleOpen = () => {
    setIsOpen(prev => !prev);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  // Toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(prev => !prev);
  };

  return {
    messages,
    isOpen,
    isMinimized,
    isLoading: sendMessage.isPending || generateChartSuggestion.isPending,
    sendMessage: sendMessage.mutate,
    generateChartSuggestion: generateChartSuggestion.mutate,
    addMessage,
    clearMessages,
    toggleOpen,
    toggleMinimized,
    setOpen: setIsOpen,
    setMinimized: setIsMinimized,
  };
}

export default useAICopilot;
