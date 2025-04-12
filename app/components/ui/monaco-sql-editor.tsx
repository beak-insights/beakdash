import Editor, { Monaco } from "@monaco-editor/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PlayIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MonacoSQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute?: (query: string) => void;
  height?: string;
  readOnly?: boolean;
  loading?: boolean;
  executeLabel?: string;
  showExecuteButton?: boolean;
  className?: string;
}

/**
 * A Monaco Editor component for SQL editing with syntax highlighting and code completion
 */
export function MonacoSQLEditor({
  value,
  onChange,
  onExecute,
  height = "300px",
  readOnly = false,
  loading = false,
  executeLabel = "Execute Query",
  showExecuteButton = true,
  className,
}: MonacoSQLEditorProps) {
  const [editorValue, setEditorValue] = useState(value);
  const [mounted, setMounted] = useState(false);

  // Sync with external value
  useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
  }, [value]);

  // Handle editor changes
  const handleEditorChange = useCallback((value: string | undefined) => {
    const newValue = value || "";
    setEditorValue(newValue);
    onChange(newValue);
  }, [onChange]);

  // Handle editor mount
  const handleEditorDidMount = useCallback(() => {
    setMounted(true);
  }, []);

  // Handle Monaco instance setup
  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    // Register SQL language features if needed
    // You can add custom SQL completions, syntax highlighting rules, etc. here
  }, []);

  // Execute the SQL query
  const executeQuery = useCallback(() => {
    if (onExecute && editorValue.trim()) {
      onExecute(editorValue);
    }
  }, [onExecute, editorValue]);

  return (
    <div className={`flex flex-col ${className}`}>
      <Card className="border rounded-md overflow-hidden w-full">
        <CardContent className="p-0">
          <div className="relative">
            <Editor
              height={height}
              language="sql"
              value={editorValue}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              beforeMount={handleEditorWillMount}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                readOnly,
                renderLineHighlight: "all",
                lineNumbers: "on",
                folding: true,
                automaticLayout: true,
                tabCompletion: "on",
                suggestOnTriggerCharacters: true,
              }}
              loading={<div className="h-full w-full flex items-center justify-center">Loading editor...</div>}
            />

            {loading && (
              <div className="absolute inset-0 bg-black/10 dark:bg-black/30 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showExecuteButton && mounted && onExecute && (
        <div className="flex justify-end mt-2">
          <Button
            onClick={executeQuery}
            disabled={loading || !editorValue.trim()}
            className="flex items-center gap-1"
          >
            {loading ? (
              <Spinner size="sm" className="mr-1" />
            ) : (
              <PlayIcon className="w-4 h-4 mr-1" />
            )}
            {executeLabel}
          </Button>
        </div>
      )}
    </div>
  );
}