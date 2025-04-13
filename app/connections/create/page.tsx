import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create Connection - BeakDash',
  description: 'Create a new data connection',
};

export default function CreateConnectionPage({ searchParams }: { searchParams: { type?: string } }) {
  // Use the type from search params to determine which tab should be active
  const defaultTab = searchParams?.type || 'sql';
  
  return (
    <AppLayout>
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
        
        <Tabs defaultValue={defaultTab} className="w-full">
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
                  <Label htmlFor="connection-name">Connection Name</Label>
                  <Input id="connection-name" placeholder="My Database Connection" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="db-type">Database Type</Label>
                  <Select defaultValue="postgresql">
                    <SelectTrigger id="db-type">
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
                  <Input id="hostname" placeholder="localhost" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input id="port" placeholder="5432" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="database">Database</Label>
                    <Input id="database" placeholder="my_database" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ssl">SSL Mode</Label>
                  <Select defaultValue="require">
                    <SelectTrigger id="ssl">
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
                <Button variant="outline">Test Connection</Button>
                <Button>Create Connection</Button>
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
                  <Label htmlFor="api-name">Connection Name</Label>
                  <Input id="api-name" placeholder="My API Connection" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input id="base-url" placeholder="https://api.example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="auth-type">Authentication Type</Label>
                  <Select defaultValue="none">
                    <SelectTrigger id="auth-type">
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
                  <Label htmlFor="api-key">API Key / Token</Label>
                  <Input id="api-key" placeholder="Enter your API key or token" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="header-name">Header Name (for API key)</Label>
                  <Input id="header-name" placeholder="X-API-Key" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Test Connection</Button>
                <Button>Create Connection</Button>
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
                  <Label htmlFor="csv-name">Connection Name</Label>
                  <Input id="csv-name" placeholder="My CSV Data" />
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
                  <Label htmlFor="csv-delimiter">Delimiter</Label>
                  <Select defaultValue="comma">
                    <SelectTrigger id="csv-delimiter">
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
                  <Label htmlFor="csv-encoding">File Encoding</Label>
                  <Select defaultValue="utf8">
                    <SelectTrigger id="csv-encoding">
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
                  <input type="checkbox" id="header-row" className="rounded border-gray-300" />
                  <Label htmlFor="header-row">First row contains column headers</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Upload and Create</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}