import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { parseCSV } from "@/lib/data-adapters";
import { Checkbox } from "@/components/ui/checkbox";

interface CSVFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function CSVForm({ config, onChange }: CSVFormProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>(config.csvData ? 'paste' : 'file');
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle when CSV config changes to generate preview data
  useEffect(() => {
    if (config.csvData) {
      setIsLoading(true);
      setError(null);
      
      // Use setTimeout to avoid blocking the UI
      setTimeout(() => {
        try {
          const data = parseCSV(config.csvData, {
            delimiter: config.delimiter || ',',
            hasHeaders: config.hasHeaders !== false,
            quoteChar: config.quoteChar || '"',
            trimFields: config.trimFields !== false
          });
          
          // Get first 5 rows for preview
          setPreviewRows(data.slice(0, 5));
          
          // Get column names
          if (data.length > 0) {
            setPreviewColumns(Object.keys(data[0]));
          }
        } catch (err: any) {
          setError(err.message || 'Failed to parse CSV data');
          setPreviewRows([]);
          setPreviewColumns([]);
        } finally {
          setIsLoading(false);
        }
      }, 100);
    } else {
      setPreviewRows([]);
      setPreviewColumns([]);
    }
  }, [config.csvData, config.delimiter, config.hasHeaders, config.quoteChar, config.trimFields]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const csvData = event.target.result as string;
        
        onChange({ 
          ...config,
          file: file.name,
          csvData,
          lastModified: file.lastModified
        });
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };
  
  const handleCsvDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ 
      ...config,
      csvData: e.target.value,
      file: null
    });
  };
  
  const handleConfigChange = (key: string, value: any) => {
    onChange({
      ...config,
      [key]: value
    });
  };
  
  const sampleCsvData = `first_name,last_name,email,age,city
John,Doe,john.doe@example.com,32,New York
Jane,Smith,jane.smith@example.com,28,San Francisco
Bob,Johnson,bob.johnson@example.com,45,Chicago
Alice,Williams,alice.williams@example.com,36,Boston
Charlie,Brown,charlie.brown@example.com,29,Seattle`;
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">CSV Connection Settings</h3>
      
      <div className="space-y-2">
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={uploadMethod === 'file' ? "default" : "outline"}
            onClick={() => setUploadMethod('file')}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload File
          </Button>
          <Button
            type="button"
            variant={uploadMethod === 'paste' ? "default" : "outline"}
            onClick={() => setUploadMethod('paste')}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-1" />
            Paste CSV
          </Button>
        </div>
        
        {uploadMethod === 'file' ? (
          <div className="border border-dashed border-input rounded-md p-4 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop your CSV file here or click to browse
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('csv-upload')?.click()}
              size="sm"
            >
              Browse Files
            </Button>
            {config.file && (
              <p className="text-sm mt-2">
                Selected file: <span className="font-medium">{config.file}</span>
                {isLoading && <Loader2 className="inline-block h-4 w-4 ml-2 animate-spin" />}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="csv-data">CSV Data</Label>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => handleCsvDataChange({ target: { value: sampleCsvData } } as any)}
                className="h-6 p-0 text-xs"
              >
                Use Sample Data
              </Button>
            </div>
            <Textarea
              id="csv-data"
              value={config.csvData || ''}
              onChange={handleCsvDataChange}
              placeholder="Paste your CSV data here..."
              rows={8}
              className="font-mono text-sm"
            />
            {isLoading && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Parsing CSV...
              </div>
            )}
          </div>
        )}
        
        {error && (
          <p className="text-sm text-destructive">
            Error: {error}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delimiter">Delimiter</Label>
          <Select
            value={config.delimiter || ','}
            onValueChange={(value) => handleConfigChange('delimiter', value)}
          >
            <SelectTrigger id="delimiter">
              <SelectValue placeholder="Select delimiter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=",">Comma (,)</SelectItem>
              <SelectItem value=";">Semicolon (;)</SelectItem>
              <SelectItem value="|">Pipe (|)</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="quoteChar">Quote Character</Label>
          <Select
            value={config.quoteChar || '"'}
            onValueChange={(value) => handleConfigChange('quoteChar', value)}
          >
            <SelectTrigger id="quoteChar">
              <SelectValue placeholder="Select quote character" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='"'>Double quote (")</SelectItem>
              <SelectItem value="'">Single quote (')</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasHeaders" 
            checked={config.hasHeaders !== false}
            onCheckedChange={(checked) => handleConfigChange('hasHeaders', checked)} 
          />
          <Label htmlFor="hasHeaders">First row contains column headers</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="trimFields" 
            checked={config.trimFields !== false}
            onCheckedChange={(checked) => handleConfigChange('trimFields', checked)}
          />
          <Label htmlFor="trimFields">Trim whitespace from fields</Label>
        </div>
      </div>
      
      <div>
        <Label htmlFor="encoding">Encoding</Label>
        <Select
          value={config.encoding || 'utf-8'}
          onValueChange={(value) => handleConfigChange('encoding', value)}
        >
          <SelectTrigger id="encoding">
            <SelectValue placeholder="Select encoding" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="utf-8">UTF-8</SelectItem>
            <SelectItem value="ascii">ASCII</SelectItem>
            <SelectItem value="windows-1252">Windows-1252</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Data Preview */}
      {previewRows.length > 0 && (
        <div>
          <Label>Preview</Label>
          <div className="border rounded-md overflow-x-auto mt-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  {previewColumns.map((col, index) => (
                    <th key={index} className="px-3 py-2 text-left font-medium text-xs">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b last:border-0">
                    {previewColumns.map((col, colIndex) => (
                      <td key={colIndex} className="px-3 py-2 truncate max-w-[200px]">
                        {row[col] !== undefined ? String(row[col]) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Showing {previewRows.length} of {config.csvData?.split('\n').length || 0} rows
          </p>
        </div>
      )}
    </div>
  );
}
