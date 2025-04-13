'use client';

import React, { useState } from 'react';
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

export function ConnectionCreateClient({ defaultTab = 'sql' }: { defaultTab?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  
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
      // In a real app, this would call an API to test the connection
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Show success message
      toast({
        title: "Connection test successful",
        description: "Successfully connected to the data source.",
        variant: "default",
      });
    } catch (error) {
      // Show error message
      toast({
        title: "Connection test failed",
        description: "Could not connect to the data source. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  // Create connection based on active tab
  const handleCreateConnection = async () => {
    setIsCreatingConnection(true);
    
    try {
      // In a real app, this would call an API to create the connection
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Show success message
      toast({
        title: "Connection created",
        description: "Your connection has been successfully created.",
        variant: "default",
      });
      
      // Redirect to connections page
      router.push('/connections');
    } catch (error) {
      // Show error message
      toast({
        title: "Failed to create connection",
        description: "There was an error creating your connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConnection(false);
    }
  };
  
  return (
    <div className="container px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/connections">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Connection</h1>
      </div>
      
      <Tabs 
        defaultValue={defaultTab} 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="sql">SQL Database</TabsTrigger>
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sql" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL Database Connection</CardTitle>
              <CardDescription>
                Connect to your SQL database using connection parameters
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
                  defaultValue={sqlFormData.type}
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
                  defaultValue={sqlFormData.sslMode}
                  onValueChange={(value) => handleSqlSelectChange('sslMode', value)}
                >
                  <SelectTrigger id="sslMode">
                    <SelectValue placeholder="Select SSL mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disable">Disable</SelectItem>
                    <SelectItem value="allow">Allow</SelectItem>
                    <SelectItem value="prefer">Prefer</SelectItem>
                    <SelectItem value="require">Require</SelectItem>
                    <SelectItem value="verify-ca">Verify CA</SelectItem>
                    <SelectItem value="verify-full">Verify Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTestingConnection || isCreatingConnection}
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
                onClick={handleCreateConnection}
                disabled={isTestingConnection || isCreatingConnection}
              >
                {isCreatingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Connection'
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
                Connect to a REST API with customizable authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input 
                  id="name" 
                  placeholder="My API Connection" 
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
                  defaultValue={restFormData.authType}
                  onValueChange={(value) => handleRestSelectChange('authType', value)}
                >
                  <SelectTrigger id="authType">
                    <SelectValue placeholder="Select authentication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
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
                disabled={isTestingConnection || isCreatingConnection}
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
                onClick={handleCreateConnection}
                disabled={isTestingConnection || isCreatingConnection}
              >
                {isCreatingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Connection'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="csv" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV File Upload</CardTitle>
              <CardDescription>
                Upload a CSV file to use as a data source
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input 
                  id="name" 
                  placeholder="My CSV Data" 
                  value={csvFormData.name}
                  onChange={handleCsvInputChange}
                />
              </div>
              
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground mb-4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your CSV file here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  or
                </p>
                <Button size="sm">
                  Browse Files
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delimiter">Delimiter</Label>
                <Select 
                  defaultValue={csvFormData.delimiter}
                  onValueChange={(value) => handleCsvSelectChange('delimiter', value)}
                >
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder="Select delimiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">Comma (,)</SelectItem>
                    <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                    <SelectItem value="pipe">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="encoding">File Encoding</Label>
                <Select 
                  defaultValue={csvFormData.encoding}
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
                onClick={handleCreateConnection}
                disabled={isCreatingConnection}
              >
                {isCreatingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload and Create'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}