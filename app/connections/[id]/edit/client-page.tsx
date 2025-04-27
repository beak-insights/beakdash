'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Loader2 } from 'lucide-react';

export function ConnectionEditClient({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isUpdatingConnection, setIsUpdatingConnection] = useState(false);
  
  // SQL form state
  const [sqlFormData, setSqlFormData] = useState({
    name: '',
    type: 'postgresql',
    hostname: '',
    port: '5432',
    database: '',
    username: '',
    password: '',
    sslMode: 'require'
  });
  
  // REST API form state
  const [restFormData, setRestFormData] = useState({
    name: '',
    baseUrl: '',
    authType: 'none',
    apiKey: '',
    headerName: 'X-API-Key'
  });
  
  // CSV form state
  const [csvFormData, setCsvFormData] = useState({
    name: '',
    delimiter: 'comma',
    encoding: 'utf8',
    hasHeaderRow: true
  });

  // Fetch connection details
  useEffect(() => {
    const fetchConnection = async () => {
      try {
        const response = await fetch(`/api/connections/${connectionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch connection details');
        }
        const data = await response.json();
        
        // Set form data based on connection type
        if (data.type === 'sql') {
          setSqlFormData({
            name: data.name,
            type: data.config.type || 'postgresql',
            hostname: data.config.hostname || '',
            port: data.config.port || '5432',
            database: data.config.database || '',
            username: data.config.username || '',
            password: data.config.password || '',
            sslMode: data.config.sslMode || 'require'
          });
        } else if (data.type === 'rest') {
          setRestFormData({
            name: data.name,
            baseUrl: data.config.baseUrl || '',
            authType: data.config.authType || 'none',
            apiKey: data.config.apiKey || '',
            headerName: data.config.headerName || 'X-API-Key'
          });
        } else {
          setCsvFormData({
            name: data.name,
            delimiter: data.config.delimiter || 'comma',
            encoding: data.config.encoding || 'utf8',
            hasHeaderRow: data.config.hasHeaderRow ?? true
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load connection details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnection();
  }, [connectionId, toast]);
  
  // Handle input changes for SQL form
  const handleSqlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSqlFormData({
      ...sqlFormData,
      [id]: value
    });
  };
  
  // Handle select changes for SQL form
  const handleSqlSelectChange = (id: string, value: string) => {
    setSqlFormData({
      ...sqlFormData,
      [id]: value
    });
  };
  
  // Handle input changes for REST form
  const handleRestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setRestFormData({
      ...restFormData,
      [id]: value
    });
  };
  
  // Handle select changes for REST form
  const handleRestSelectChange = (id: string, value: string) => {
    setRestFormData({
      ...restFormData,
      [id]: value
    });
  };
  
  // Handle input changes for CSV form
  const handleCsvInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCsvFormData({
      ...csvFormData,
      [id]: value
    });
  };
  
  // Handle checkbox changes for CSV form
  const handleCsvCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvFormData({
      ...csvFormData,
      hasHeaderRow: e.target.checked
    });
  };
  
  // Handle select changes for CSV form
  const handleCsvSelectChange = (id: string, value: string) => {
    setCsvFormData({
      ...csvFormData,
      [id]: value
    });
  };
  
  // Test connection based on active tab
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Prepare the data to send based on active tab
      let connectionData;
      
      if (sqlFormData.type) {
        connectionData = {
          type: sqlFormData.type,
          hostname: sqlFormData.hostname,
          port: sqlFormData.port,
          database: sqlFormData.database,
          username: sqlFormData.username,
          password: sqlFormData.password,
          sslMode: sqlFormData.sslMode
        };
      } else if (restFormData.baseUrl) {
        connectionData = {
          type: 'rest',
          baseUrl: restFormData.baseUrl,
          authType: restFormData.authType,
          apiKey: restFormData.apiKey,
          headerName: restFormData.headerName
        };
      } else {
        // CSV doesn't require a connection test
        toast({
          title: "No connection test needed",
          description: "CSV files don't require a connection test. You can proceed with updating the connection.",
          variant: "default",
        });
        setIsTestingConnection(false);
        return;
      }
      
      // Make API call to test connection
      const response = await fetch('/api/connections/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Connection successful",
          description: "The connection test was successful.",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection failed",
          description: data.error || "Failed to connect to the database.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  // Update connection based on active tab
  const handleUpdateConnection = async () => {
    setIsUpdatingConnection(true);
    
    try {
      // Prepare the data to send based on active tab
      let connectionData;
      
      if (sqlFormData.type) {
        if (!sqlFormData.name) {
          toast({
            title: "Missing connection name",
            description: "Please provide a name for your connection.",
            variant: "destructive",
          });
          setIsUpdatingConnection(false);
          return;
        }
        
        connectionData = {
          name: sqlFormData.name,
          type: sqlFormData.type,
          hostname: sqlFormData.hostname,
          port: sqlFormData.port,
          database: sqlFormData.database,
          username: sqlFormData.username,
          password: sqlFormData.password,
          sslMode: sqlFormData.sslMode
        };
      } else if (restFormData.baseUrl) {
        if (!restFormData.name) {
          toast({
            title: "Missing connection name",
            description: "Please provide a name for your connection.",
            variant: "destructive",
          });
          setIsUpdatingConnection(false);
          return;
        }
        
        connectionData = {
          name: restFormData.name,
          type: 'rest',
          baseUrl: restFormData.baseUrl,
          authType: restFormData.authType,
          apiKey: restFormData.apiKey,
          headerName: restFormData.headerName
        };
      } else {
        // CSV
        if (!csvFormData.name) {
          toast({
            title: "Missing connection name",
            description: "Please provide a name for your CSV connection.",
            variant: "destructive",
          });
          setIsUpdatingConnection(false);
          return;
        }
        
        connectionData = {
          name: csvFormData.name,
          type: 'csv',
          delimiter: csvFormData.delimiter,
          encoding: csvFormData.encoding,
          hasHeaderRow: csvFormData.hasHeaderRow
        };
      }
      
      // Make API call to update connection
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Show success message
        toast({
          title: "Connection updated",
          description: "Your connection has been successfully updated.",
          variant: "default",
        });
        
        // Redirect to connections page
        router.push('/connections');
      } else {
        // Show error message with details from the API
        toast({
          title: "Failed to update connection",
          description: data.error || "There was an error updating your connection. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Show error message
      toast({
        title: "Failed to update connection",
        description: "There was an error updating your connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingConnection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/connections" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Connections
        </Link>
      </div>

      <Tabs defaultValue={sqlFormData.type ? 'sql' : restFormData.baseUrl ? 'rest' : 'csv'} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sql">SQL Database</TabsTrigger>
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="csv">CSV File</TabsTrigger>
        </TabsList>

        <TabsContent value="sql" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL Database Connection</CardTitle>
              <CardDescription>
                Update your SQL database connection parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input 
                  id="name" 
                  placeholder="My Database Connection" 
                  value={sqlFormData.name}
                  onChange={handleSqlInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Database Type</Label>
                <Select 
                  value={sqlFormData.type}
                  onValueChange={(value) => handleSqlSelectChange('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlserver">SQL Server</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hostname">Hostname</Label>
                <Input 
                  id="hostname" 
                  placeholder="localhost" 
                  value={sqlFormData.hostname}
                  onChange={handleSqlInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input 
                    id="port" 
                    placeholder="5432" 
                    value={sqlFormData.port}
                    onChange={handleSqlInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input 
                    id="database" 
                    placeholder="my_database" 
                    value={sqlFormData.database}
                    onChange={handleSqlInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="username" 
                    value={sqlFormData.username}
                    onChange={handleSqlInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={sqlFormData.password}
                    onChange={handleSqlInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sslMode">SSL Mode</Label>
                <Select 
                  value={sqlFormData.sslMode}
                  onValueChange={(value) => handleSqlSelectChange('sslMode', value)}
                >
                  <SelectTrigger id="sslMode">
                    <SelectValue placeholder="Select SSL mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="require">Require</SelectItem>
                    <SelectItem value="prefer">Prefer</SelectItem>
                    <SelectItem value="disable">Disable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTestingConnection || isUpdatingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <Button 
                onClick={handleUpdateConnection}
                disabled={isTestingConnection || isUpdatingConnection}
              >
                {isUpdatingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Connection'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="rest" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>REST API Connection</CardTitle>
              <CardDescription>
                Update your REST API connection parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input 
                  id="name" 
                  placeholder="My REST API Connection" 
                  value={restFormData.name}
                  onChange={handleRestInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input 
                  id="baseUrl" 
                  placeholder="https://api.example.com" 
                  value={restFormData.baseUrl}
                  onChange={handleRestInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authType">Authentication Type</Label>
                <Select 
                  value={restFormData.authType}
                  onValueChange={(value) => handleRestSelectChange('authType', value)}
                >
                  <SelectTrigger id="authType">
                    <SelectValue placeholder="Select authentication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="apiKey">API Key</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key / Token</Label>
                <Input 
                  id="apiKey" 
                  placeholder="Enter your API key or token" 
                  value={restFormData.apiKey}
                  onChange={handleRestInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headerName">Header Name (for API key)</Label>
                <Input 
                  id="headerName" 
                  placeholder="X-API-Key" 
                  value={restFormData.headerName}
                  onChange={handleRestInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTestingConnection || isUpdatingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <Button 
                onClick={handleUpdateConnection}
                disabled={isTestingConnection || isUpdatingConnection}
              >
                {isUpdatingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Connection'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV File Connection</CardTitle>
              <CardDescription>
                Update your CSV file connection parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input 
                  id="name" 
                  placeholder="My CSV Connection" 
                  value={csvFormData.name}
                  onChange={handleCsvInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delimiter">Delimiter</Label>
                <Select 
                  value={csvFormData.delimiter}
                  onValueChange={(value) => handleCsvSelectChange('delimiter', value)}
                >
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder="Select delimiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">Comma (,)</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                    <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                    <SelectItem value="space">Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="encoding">Encoding</Label>
                <Select 
                  value={csvFormData.encoding}
                  onValueChange={(value) => handleCsvSelectChange('encoding', value)}
                >
                  <SelectTrigger id="encoding">
                    <SelectValue placeholder="Select encoding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utf8">UTF-8</SelectItem>
                    <SelectItem value="latin1">Latin-1</SelectItem>
                    <SelectItem value="ascii">ASCII</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="hasHeaderRow" 
                  className="rounded border-gray-300" 
                  checked={csvFormData.hasHeaderRow}
                  onChange={handleCsvCheckboxChange}
                />
                <Label htmlFor="hasHeaderRow">First row contains column headers</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleUpdateConnection}
                disabled={isUpdatingConnection}
              >
                {isUpdatingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Connection'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 