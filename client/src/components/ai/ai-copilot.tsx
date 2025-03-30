import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, X, Minimize, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AICopilotProps {
  onClose: () => void;
}

export default function AICopilot({ onClose }: AICopilotProps) {
  const [prompt, setPrompt] = useState("");
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
        });
        return response;
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
        content: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(data.timestamp) || new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
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
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send to AI
    aiMutation.mutate(prompt);
    
    // Clear input
    setPrompt("");
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
      </CardContent>
      
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSend} className="flex space-x-2 w-full">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question..."
            disabled={aiMutation.isPending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={aiMutation.isPending || !prompt.trim()}
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
      </CardFooter>
    </Card>
  );
}
