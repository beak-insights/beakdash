'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  FileText, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  Check, 
  X, 
  Filter, 
  Search 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dbQaCategoryTypes, dbQaFrequencyTypes } from '@/lib/db/schema';

// Placeholder for actual data fetching
const mockQueries = [
  {
    id: 1,
    name: 'Check for null values in important columns',
    category: 'data_completeness',
    lastStatus: 'success',
    executionFrequency: 'daily',
    lastExecutionTime: '2025-04-12T10:30:00Z',
    connectionName: 'Production DB',
  },
  {
    id: 2,
    name: 'Verify foreign key integrity',
    category: 'data_integrity',
    lastStatus: 'warning',
    executionFrequency: 'hourly',
    lastExecutionTime: '2025-04-13T09:15:00Z',
    connectionName: 'Production DB',
  },
  {
    id: 3,
    name: 'Detect duplicate customer records',
    category: 'data_uniqueness',
    lastStatus: 'error',
    executionFrequency: 'daily',
    lastExecutionTime: '2025-04-12T23:00:00Z',
    connectionName: 'Customer DB',
  },
];

export function DbQaQueriesClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // These would be fetched from an API in a production app
  const queries = mockQueries;

  // Placeholder for actual filtering logic
  const filteredQueries = queries.filter(query => {
    // Filter by search term
    if (searchTerm && !query.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (categoryFilter && categoryFilter !== 'all' && query.category !== categoryFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter && statusFilter !== 'all' && query.lastStatus !== statusFilter) {
      return false;
    }
    
    // Tab filtering
    if (activeTab === 'active' && query.executionFrequency === 'manual') {
      return false;
    }
    if (activeTab === 'manual' && query.executionFrequency !== 'manual') {
      return false;
    }
    
    return true;
  });

  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case 'error':
        return <Badge className="bg-red-500">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Function to get category badge styles
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'data_completeness':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{category}</Badge>;
      case 'data_consistency':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{category}</Badge>;
      case 'data_accuracy':
        return <Badge variant="outline" className="border-cyan-500 text-cyan-500">{category}</Badge>;
      case 'data_integrity':
        return <Badge variant="outline" className="border-emerald-500 text-emerald-500">{category}</Badge>;
      case 'data_timeliness':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">{category}</Badge>;
      case 'data_uniqueness':
        return <Badge variant="outline" className="border-rose-500 text-rose-500">{category}</Badge>;
      case 'data_relationship':
        return <Badge variant="outline" className="border-indigo-500 text-indigo-500">{category}</Badge>;
      case 'sensitive_data_exposure':
        return <Badge variant="outline" className="border-red-500 text-red-500">{category}</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search checks..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                <SelectItem value="all">All Categories</SelectItem>
                {dbQaCategoryTypes.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <Button asChild>
          <Link href="/db-qa/queries/create">
            <Plus className="mr-2 h-4 w-4" />
            New Check
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Checks</TabsTrigger>
          <TabsTrigger value="active">Active Checks</TabsTrigger>
          <TabsTrigger value="manual">Manual Checks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQueries.length > 0 ? (
              filteredQueries.map((query) => (
                <Card key={query.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{query.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Connection: {query.connectionName}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                              <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z" fill="currentColor"></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Run Now</DropdownMenuItem>
                          <DropdownMenuItem>View History</DropdownMenuItem>
                          <DropdownMenuItem>Edit Check</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete Check</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getCategoryBadge(query.category)}
                      {getStatusBadge(query.lastStatus)}
                      <Badge variant="secondary">{query.executionFrequency}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Last run: {new Date(query.lastExecutionTime).toLocaleString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="ghost" size="sm">
                      View Results
                    </Button>
                    <Button variant="outline" size="sm">
                      Run Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No quality checks found</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                  {searchTerm || categoryFilter || statusFilter
                    ? "Try changing or clearing your filters"
                    : "Get started by creating your first database quality check"}
                </p>
                <Button asChild>
                  <Link href="/db-qa/queries/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Check
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="pt-4">
          {/* Same content as 'all' but filtered for active checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtered content for active checks would go here */}
            {filteredQueries.length > 0 ? (
              filteredQueries.map((query) => (
                <Card key={query.id} className="overflow-hidden">
                  {/* Same card content as above */}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{query.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Connection: {query.connectionName}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                              <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z" fill="currentColor"></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Run Now</DropdownMenuItem>
                          <DropdownMenuItem>View History</DropdownMenuItem>
                          <DropdownMenuItem>Edit Check</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete Check</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getCategoryBadge(query.category)}
                      {getStatusBadge(query.lastStatus)}
                      <Badge variant="secondary">{query.executionFrequency}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Last run: {new Date(query.lastExecutionTime).toLocaleString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="ghost" size="sm">
                      View Results
                    </Button>
                    <Button variant="outline" size="sm">
                      Run Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No active checks found</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                  Create scheduled checks to automatically monitor your database quality
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Active Check
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="manual" className="pt-4">
          {/* Same content as 'all' but filtered for manual checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtered content for manual checks would go here */}
            <div className="col-span-3 py-12 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No manual checks found</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                Manual checks let you run quality verifications on demand
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Manual Check
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}