'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSync: string | null;
  error: string | null;
}

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/user/integrations');
      if (!response.ok) throw new Error('Failed to fetch integrations');
      const data = await response.json();
      setIntegrations(data.integrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    }
  };

  const handleSync = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user/integrations/${id}/sync`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to sync integration');

      const data = await response.json();
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === id ? { ...integration, ...data } : integration
        )
      );
      toast.success('Integration synced successfully');
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast.error('Failed to sync integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/user/integrations?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete integration');

      setIntegrations(prev => prev.filter(integration => integration.id !== id));
      toast.success('Integration deleted successfully');
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Failed to delete integration');
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'inactive':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Integrations</h3>
        
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{integration.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Type: {integration.type}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSync(integration.id)}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(integration.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-sm ${getStatusColor(integration.status)}`}>
                  {integration.status}
                </span>
                {integration.error && (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{integration.error}</span>
                  </div>
                )}
              </div>

              {integration.lastSync && (
                <p className="text-sm text-muted-foreground">
                  Last synced: {new Date(integration.lastSync).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button variant="outline" className="w-full">
            Add New Integration
          </Button>
        </div>
      </div>
    </div>
  );
} 