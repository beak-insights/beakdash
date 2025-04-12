import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SQLFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function SQLForm({ config, onChange }: SQLFormProps) {
  const updateConfig = (key: string, value: any) => {
    onChange({ [key]: value });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">SQL Database Connection Settings</h3>
      
      <div>
        <Label htmlFor="dbType" className="mb-1 block">Database Type</Label>
        <Select
          value={config.dbType || 'mysql'}
          onValueChange={(value) => updateConfig('dbType', value)}
        >
          <SelectTrigger id="dbType">
            <SelectValue placeholder="Select database type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="sqlite">SQLite</SelectItem>
            <SelectItem value="mssql">Microsoft SQL Server</SelectItem>
            <SelectItem value="oracle">Oracle</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {config.dbType !== 'sqlite' && (
        <>
          <div>
            <Label htmlFor="host" className="mb-1 block">Host</Label>
            <Input
              id="host"
              value={config.host || ''}
              onChange={(e) => updateConfig('host', e.target.value)}
              placeholder="e.g., localhost or db.example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="port" className="mb-1 block">Port</Label>
            <Input
              id="port"
              type="number"
              value={config.port || getDefaultPort(config.dbType)}
              onChange={(e) => updateConfig('port', e.target.value)}
              placeholder="Port number"
            />
          </div>
        </>
      )}
      
      <div>
        <Label htmlFor="database" className="mb-1 block">Database Name</Label>
        <Input
          id="database"
          value={config.database || ''}
          onChange={(e) => updateConfig('database', e.target.value)}
          placeholder="Enter database name"
        />
      </div>
      
      {config.dbType !== 'sqlite' && (
        <>
          <div>
            <Label htmlFor="username" className="mb-1 block">Username</Label>
            <Input
              id="username"
              value={config.username || ''}
              onChange={(e) => updateConfig('username', e.target.value)}
              placeholder="Database username"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="mb-1 block">Password</Label>
            <Input
              id="password"
              type="password"
              value={config.password || ''}
              onChange={(e) => updateConfig('password', e.target.value)}
              placeholder="Database password"
            />
          </div>
        </>
      )}
      
      {config.dbType === 'sqlite' && (
        <div>
          <Label htmlFor="filename" className="mb-1 block">SQLite Filename</Label>
          <Input
            id="filename"
            value={config.filename || ''}
            onChange={(e) => updateConfig('filename', e.target.value)}
            placeholder="Path to SQLite database file"
          />
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ssl"
          checked={config.ssl === true}
          onChange={(e) => updateConfig('ssl', e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="ssl">Use SSL/TLS Connection</Label>
      </div>
      
      <div>
        <Label htmlFor="connectionString" className="mb-1 block">Connection String (Optional)</Label>
        <Input
          id="connectionString"
          value={config.connectionString || ''}
          onChange={(e) => updateConfig('connectionString', e.target.value)}
          placeholder="Enter a custom connection string if needed"
        />
        <p className="text-xs text-muted-foreground mt-1">
          If provided, this will override individual connection settings above
        </p>
      </div>
      
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium mb-2">Connection Pooling</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxConnections" className="mb-1 block">Max Connections</Label>
            <Input
              id="maxConnections"
              type="number"
              value={config.maxConnections || '10'}
              onChange={(e) => updateConfig('maxConnections', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="idleTimeout" className="mb-1 block">Idle Timeout (ms)</Label>
            <Input
              id="idleTimeout"
              type="number"
              value={config.idleTimeout || '10000'}
              onChange={(e) => updateConfig('idleTimeout', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium mb-2">Advanced Options</h4>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="debug"
            checked={config.debug === true}
            onChange={(e) => updateConfig('debug', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="debug">Enable Debug Logging</Label>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="multipleStatements"
            checked={config.multipleStatements === true}
            onChange={(e) => updateConfig('multipleStatements', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="multipleStatements">Allow Multiple Statements</Label>
        </div>
      </div>
    </div>
  );
}

// Helper to get default port for database type
function getDefaultPort(dbType?: string): string {
  switch (dbType) {
    case 'mysql':
      return '3306';
    case 'postgresql':
      return '5432';
    case 'mssql':
      return '1433';
    case 'oracle':
      return '1521';
    default:
      return '';
  }
}
