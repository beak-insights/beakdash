import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useWebSocket } from "./lib/websocket-service";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Connections from "@/pages/dashboard/connections";
import Datasets from "@/pages/dashboard/datasets";
import Settings from "@/pages/dashboard/settings";
import Widgets from "@/pages/widgets";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard/:id" component={Dashboard} />
      <Route path="/connections" component={Connections} />
      <Route path="/datasets" component={Datasets} />
      <Route path="/settings" component={Settings} />
      <Route path="/widgets" component={Widgets} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize WebSocket connection when the app starts
  const { connect, disconnect } = useWebSocket();
  
  useEffect(() => {
    // Connect to WebSocket server
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
