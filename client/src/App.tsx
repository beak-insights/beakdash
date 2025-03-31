import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useWebSocket } from "./lib/websocket-service";
import { useEffect } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Connections from "@/pages/dashboard/connections";
import Datasets from "@/pages/dashboard/datasets";
import Settings from "@/pages/dashboard/settings";
import Widgets from "@/pages/widgets";
import Profile from "@/pages/dashboard/profile";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboards" component={HomePage} />
      <ProtectedRoute path="/dashboard/:id" component={Dashboard} />
      <ProtectedRoute path="/connections" component={Connections} />
      <ProtectedRoute path="/datasets" component={Datasets} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/widgets" component={Widgets} />
      <Route path="/auth" component={AuthPage} />
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
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
