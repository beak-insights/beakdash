import { useState } from "react";
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
import { Upload } from "lucide-react";

interface CSVFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function CSVForm({ config, onChange }: CSVFormProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>(config.csvData ? 'paste' : 'file');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange({ 
          file: file.name,
          csvData: event.target.result as string,
          lastModified: file.lastModified
        });
      }
    };
    reader.readAsText(file);
  };
  
  const handleCsvDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ 
      csvData: e.target.value,
      file: null
    });
  };
  
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
            Upload File
          </Button>
          <Button
            type="button"
            variant={uploadMethod === 'paste' ? "default" : "outline"}
            onClick={() => setUploadMethod('paste')}
            className="flex-1"
          >
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
              </p>
            )}
          </div>
        ) : (
          <div>
            <Label htmlFor="csv-data">CSV Data</Label>
            <Textarea
              id="csv-data"
              value={config.csvData || ''}
              onChange={handleCsvDataChange}
              placeholder="Paste your CSV data here..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delimiter">Delimiter</Label>
          <Select
            value={config.delimiter || ','}
            onValueChange={(value) => onChange({ delimiter: value })}
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
            onValueChange={(value) => onChange({ quoteChar: value })}
          >
            <SelectTrigger id="quoteChar">
              <SelectValue placeholder="Select quote character" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='"'>Double quote (")</SelectItem>
              <SelectItem value="'">Single quote (')</SelectItem>
              <SelectItem value="">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasHeaders"
          checked={config.hasHeaders !== false}
          onChange={(e) => onChange({ hasHeaders: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="hasHeaders">First row contains column headers</Label>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="trimFields"
          checked={config.trimFields !== false}
          onChange={(e) => onChange({ trimFields: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="trimFields">Trim whitespace from fields</Label>
      </div>
      
      <div>
        <Label htmlFor="encoding">Encoding</Label>
        <Select
          value={config.encoding || 'utf-8'}
          onValueChange={(value) => onChange({ encoding: value })}
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
    </div>
  );
}
