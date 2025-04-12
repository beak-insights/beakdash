import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RESTFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function RESTForm({ config, onChange }: RESTFormProps) {
  const updateConfig = (key: string, value: any) => {
    onChange({ [key]: value });
  };
  
  const addHeader = () => {
    const headers = config.headers || [];
    onChange({
      headers: [...headers, { key: '', value: '' }]
    });
  };
  
  const updateHeader = (index: number, key: string, value: string) => {
    const headers = [...(config.headers || [])];
    headers[index] = { ...headers[index], [key]: value };
    onChange({ headers });
  };
  
  const removeHeader = (index: number) => {
    const headers = [...(config.headers || [])];
    headers.splice(index, 1);
    onChange({ headers });
  };
  
  const addParam = () => {
    const params = config.params || [];
    onChange({
      params: [...params, { key: '', value: '' }]
    });
  };
  
  const updateParam = (index: number, key: string, value: string) => {
    const params = [...(config.params || [])];
    params[index] = { ...params[index], [key]: value };
    onChange({ params });
  };
  
  const removeParam = (index: number) => {
    const params = [...(config.params || [])];
    params.splice(index, 1);
    onChange({ params });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">REST API Connection Settings</h3>
      
      <div>
        <Label htmlFor="url" className="mb-1 block">API URL</Label>
        <Input
          id="url"
          value={config.url || ''}
          onChange={(e) => updateConfig('url', e.target.value)}
          placeholder="https://api.example.com/data"
        />
      </div>
      
      <div>
        <Label htmlFor="method" className="mb-1 block">HTTP Method</Label>
        <Select
          value={config.method || 'GET'}
          onValueChange={(value) => updateConfig('method', value)}
        >
          <SelectTrigger id="method">
            <SelectValue placeholder="Select HTTP method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="headers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="params">Query Params</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>
        
        <TabsContent value="headers" className="space-y-4 pt-2">
          {(config.headers || []).map((header: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                placeholder="Header name"
                className="flex-1"
              />
              <Input
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeHeader(index)}
                className="text-destructive hover:text-destructive/80"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addHeader}
            className="text-sm text-primary hover:text-primary/80"
          >
            + Add Header
          </button>
        </TabsContent>
        
        <TabsContent value="params" className="space-y-4 pt-2">
          {(config.params || []).map((param: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={param.key}
                onChange={(e) => updateParam(index, 'key', e.target.value)}
                placeholder="Parameter name"
                className="flex-1"
              />
              <Input
                value={param.value}
                onChange={(e) => updateParam(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeParam(index)}
                className="text-destructive hover:text-destructive/80"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addParam}
            className="text-sm text-primary hover:text-primary/80"
          >
            + Add Parameter
          </button>
        </TabsContent>
        
        <TabsContent value="body" className="pt-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="contentType" className="mb-1 block">Content Type</Label>
              <Select
                value={config.contentType || 'application/json'}
                onValueChange={(value) => updateConfig('contentType', value)}
              >
                <SelectTrigger id="contentType">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application/json">application/json</SelectItem>
                  <SelectItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</SelectItem>
                  <SelectItem value="multipart/form-data">multipart/form-data</SelectItem>
                  <SelectItem value="text/plain">text/plain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="body" className="mb-1 block">Request Body</Label>
              <Textarea
                id="body"
                value={config.body || ''}
                onChange={(e) => updateConfig('body', e.target.value)}
                placeholder={config.contentType === 'application/json' ? '{\n  "key": "value"\n}' : 'key=value&another=something'}
                rows={5}
                className={config.contentType === 'application/json' ? 'font-mono text-sm' : ''}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="resultRoot" className="mb-1 block">Result Root Path (optional)</Label>
          <Input
            id="resultRoot"
            value={config.resultRoot || ''}
            onChange={(e) => updateConfig('resultRoot', e.target.value)}
            placeholder="e.g., data.items or leave empty"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Specify the path to the array of results in the response (e.g., "data.items" for nested data)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useAuth"
            checked={config.useAuth === true}
            onChange={(e) => updateConfig('useAuth', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="useAuth">Use Authentication</Label>
        </div>
        
        {config.useAuth && (
          <div>
            <Label htmlFor="authType" className="mb-1 block">Authentication Type</Label>
            <Select
              value={config.authType || 'bearer'}
              onValueChange={(value) => updateConfig('authType', value)}
            >
              <SelectTrigger id="authType">
                <SelectValue placeholder="Select authentication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="apiKey">API Key</SelectItem>
              </SelectContent>
            </Select>
            
            {config.authType === 'bearer' && (
              <div className="mt-2">
                <Label htmlFor="token" className="mb-1 block">Bearer Token</Label>
                <Input
                  id="token"
                  value={config.token || ''}
                  onChange={(e) => updateConfig('token', e.target.value)}
                  type="password"
                  placeholder="Enter your bearer token"
                />
              </div>
            )}
            
            {config.authType === 'basic' && (
              <div className="mt-2 space-y-2">
                <div>
                  <Label htmlFor="username" className="mb-1 block">Username</Label>
                  <Input
                    id="username"
                    value={config.username || ''}
                    onChange={(e) => updateConfig('username', e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="mb-1 block">Password</Label>
                  <Input
                    id="password"
                    value={config.password || ''}
                    onChange={(e) => updateConfig('password', e.target.value)}
                    type="password"
                    placeholder="Enter password"
                  />
                </div>
              </div>
            )}
            
            {config.authType === 'apiKey' && (
              <div className="mt-2 space-y-2">
                <div>
                  <Label htmlFor="apiKeyName" className="mb-1 block">API Key Name</Label>
                  <Input
                    id="apiKeyName"
                    value={config.apiKeyName || ''}
                    onChange={(e) => updateConfig('apiKeyName', e.target.value)}
                    placeholder="e.g., x-api-key"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKeyValue" className="mb-1 block">API Key Value</Label>
                  <Input
                    id="apiKeyValue"
                    value={config.apiKeyValue || ''}
                    onChange={(e) => updateConfig('apiKeyValue', e.target.value)}
                    type="password"
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKeyLocation" className="mb-1 block">API Key Location</Label>
                  <Select
                    value={config.apiKeyLocation || 'header'}
                    onValueChange={(value) => updateConfig('apiKeyLocation', value)}
                  >
                    <SelectTrigger id="apiKeyLocation">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="query">Query Parameter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
