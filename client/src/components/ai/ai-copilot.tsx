import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, X, Minimize, Maximize, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dataset, chartTypes } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: {
    datasetId?: number;
    chartType?: string;
  };
}

interface AICopilotProps {
  onClose: () => void;
  activeDatasetId?: number;
  activeChartType?: string;
}

export default function AICopilot({ onClose, activeDatasetId, activeChartType }: AICopilotProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | undefined>(activeDatasetId);
  const [selectedChartType, setSelectedChartType] = useState<string | undefined>(activeChartType);
  const [showDatasetSelector, setShowDatasetSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI Copilot. How can I help you with your dashboard today?",
      timestamp: new Date(),
    },
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available datasets
  const { data: datasets = [] } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets'],
    enabled: showDatasetSelector,
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message to AI Copilot
  const aiMutation = useMutation({
    mutationFn: async (message: string) => {
      try {
        const response = await apiRequest("POST", "/api/ai/copilot", {
          prompt: message,
          context: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
          datasetId: selectedDatasetId,
          chartType: selectedChartType,
        });
        
        // Type guard to check if we have a proper response object
        if (response && typeof response === 'object' && 'response' in response) {
          return response as { response: string; timestamp: string };
        }
        
        // Fallback if the response is not in the expected format
        return {
          response: "I'm sorry, I couldn't process that request.",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("AI Copilot error:", error);
        return {
          response: "I encountered an error while processing your request. Please try again later.",
          timestamp: new Date().toISOString(),
        };
      }
    },
    onSuccess: (data) => {
      // Add AI response to messages
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(data.timestamp || new Date()),
        context: {
          datasetId: selectedDatasetId,
          chartType: selectedChartType,
        }
      };
      setMessages(prev => [...prev, aiResponse]);
    },
  });

  // Define the expected chart recommendation response type
  interface ChartRecommendation {
    chartType: string;
    explanation: string;
    suggestedConfig: string;
    datasetId: number;
  }

  // Generate chart recommendation
  const chartRecommendationMutation = useMutation({
    mutationFn: async (datasetId: number) => {
      const response = await apiRequest("POST", "/api/ai/chart-recommendation", { datasetId });
      
      // Type guard to ensure we have a proper chart recommendation
      if (response && typeof response === 'object' && 'chartType' in response) {
        return response as ChartRecommendation;
      }
      
      // Fallback if the response is not in the expected format
      throw new Error("Received invalid chart recommendation format");
    },
    onSuccess: (data: ChartRecommendation) => {
      // Add recommendation to messages
      const recommendationMessage: Message = {
        id: `recommendation-${Date.now()}`,
        role: "assistant",
        content: `I've analyzed your dataset and recommend a ${data.chartType} chart.\n\n${data.explanation}\n\n${data.suggestedConfig}\n\nWould you like me to help you set up this chart?`,
        timestamp: new Date(),
        context: {
          datasetId: selectedDatasetId,
          chartType: data.chartType,
        }
      };
      setMessages(prev => [...prev, recommendationMessage]);
      setSelectedChartType(data.chartType);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date(),
      context: {
        datasetId: selectedDatasetId,
        chartType: selectedChartType,
      }
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send to AI
    aiMutation.mutate(prompt);
    
    // Clear input
    setPrompt("");
  };

  const handleGetChartRecommendation = () => {
    if (!selectedDatasetId) {
      // If no dataset is selected, show the dataset selector
      setShowDatasetSelector(true);
      return;
    }

    const promptMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: `Please analyze dataset ${selectedDatasetId} and recommend the best chart type for visualization.`,
      timestamp: new Date(),
      context: {
        datasetId: selectedDatasetId
      }
    };
    setMessages(prev => [...prev, promptMessage]);
    
    // Generate recommendation
    chartRecommendationMutation.mutate(selectedDatasetId);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-40 rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg"
        onClick={toggleMinimize}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-40 w-80 h-96 flex flex-col shadow-lg border border-border overflow-hidden">
      <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 bg-primary">
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-sm">AI Copilot</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMinimize}>
            <Minimize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 flex-1 overflow-y-auto">
        {showDatasetSelector ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Select a Dataset</h4>
            {datasets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No datasets available. Please create a dataset first.</p>
            ) : (
              <>
                <Select
                  value={selectedDatasetId?.toString() || ""}
                  onValueChange={(value) => setSelectedDatasetId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id.toString()}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDatasetSelector(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setShowDatasetSelector(false);
                      if (selectedDatasetId) {
                        handleGetChartRecommendation();
                      }
                    }}
                    disabled={!selectedDatasetId}
                  >
                    Confirm
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start space-x-2", {
                  "justify-end": message.role === "user",
                })}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-6 w-6 bg-primary text-primary-foreground">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn("p-2 rounded-lg max-w-[80%]", {
                    "bg-muted": message.role === "assistant",
                    "bg-primary/10": message.role === "user",
                  })}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  {message.context?.datasetId && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Dataset: {message.context.datasetId}
                      {message.context.chartType && ` | Chart: ${message.context.chartType}`}
                    </div>
                  )}
                </div>
                
                {message.role === "user" && (
                  <Avatar className="h-6 w-6 bg-secondary text-secondary-foreground">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 border-t">
        {!showDatasetSelector && (
          <>
            <div className="flex items-center space-x-2 w-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                title="Get chart recommendation"
                onClick={handleGetChartRecommendation}
                disabled={aiMutation.isPending || chartRecommendationMutation.isPending}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              
              <form onSubmit={handleSend} className="flex space-x-2 flex-1">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={aiMutation.isPending || chartRecommendationMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={aiMutation.isPending || chartRecommendationMutation.isPending || !prompt.trim()}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </Button>
              </form>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
