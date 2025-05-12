import Editor, { Monaco } from "@monaco-editor/react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PlayIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ISchemaInfo } from "@/types";

/**
 * Schema information structure for SQL autocompletion
 */


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
  schemaInfo?: ISchemaInfo;
}

/**
 * A Monaco Editor component for SQL editing with enhanced syntax highlighting and code completion
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
  schemaInfo,
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
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newValue = value || "";
      setEditorValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  // Handle editor mount
  const handleEditorDidMount = useCallback(() => {
    setMounted(true);
  }, []);

  // Configure SQL language features
  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    // Define SQL keywords for autocompletion
    const sqlKeywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 
      'OUTER JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 
      'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 
      'ALTER TABLE', 'DROP TABLE', 'CREATE INDEX', 'DROP INDEX', 'AND', 'OR', 
      'NOT', 'NULL', 'IS NULL', 'IS NOT NULL', 'LIKE', 'IN', 'BETWEEN', 
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
      'DISTINCT', 'AS', 'WITH', 'UNION', 'ALL', 'INTERSECT', 'EXCEPT'
    ];

    // Define common SQL data types
    const sqlDataTypes = [
      'INTEGER', 'INT', 'SMALLINT', 'TINYINT', 'BIGINT', 'DECIMAL', 'NUMERIC', 
      'FLOAT', 'REAL', 'DOUBLE PRECISION', 'CHAR', 'VARCHAR', 'TEXT', 'DATE', 
      'TIME', 'TIMESTAMP', 'BOOLEAN', 'BLOB', 'JSONB', 'JSON', 'UUID'
    ];

    // Register SQL language features (if not already registered)
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'sql')) {
      monaco.languages.register({ id: 'sql' });
    }

    // Set up autocomplete provider
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // Get text up to the cursor to analyze context
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        // Create suggestions for keywords
        const keywordSuggestions = sqlKeywords.map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range: range
        }));

        // Create suggestions for data types
        const dataTypeSuggestions = sqlDataTypes.map(dataType => ({
          label: dataType,
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: dataType,
          range: range
        }));

        // Generate table and column suggestions from schema info
        let tableSuggestions: any[] = [];
        let columnSuggestions: any[] = [];
        
        if (schemaInfo) {
          // Extract tables from all schemas
          for (const schemaName in schemaInfo) {
            const schema = schemaInfo[schemaName];
            
            // Add tables for this schema
            for (const tableName in schema) {
              tableSuggestions.push({
                label: tableName,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: tableName,
                range: range,
                detail: `Table (${schemaName})`
              });
              
              // Add fully qualified table name
              tableSuggestions.push({
                label: `${schemaName}.${tableName}`,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: `${schemaName}.${tableName}`,
                range: range,
                detail: 'Fully qualified table'
              });
              
              // Add columns for this table
              const columns = schema[tableName];
              for (const columnInfo of columns) {
                // Simple column suggestion
                columnSuggestions.push({
                  label: columnInfo.column,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: columnInfo.column,
                  range: range,
                  detail: `Column (${columnInfo.type}) from ${tableName}`
                });
                
                // Fully qualified column suggestion
                columnSuggestions.push({
                  label: `${tableName}.${columnInfo.column}`,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: `${tableName}.${columnInfo.column}`,
                  range: range,
                  detail: `Column (${columnInfo.type})`
                });
              }
            }
          }
        } else {
          // Fallback to sample tables and columns if no schema info provided
          const sampleTables = ['users', 'orders', 'products', 'customers'];
          tableSuggestions = sampleTables.map(table => ({
            label: table,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: table,
            range: range,
            detail: 'Table (sample)'
          }));

          const sampleColumns = [
            'id', 'name', 'email', 'created_at', 'price', 'quantity', 
            'status', 'user_id', 'product_id', 'order_id', 'description'
          ];
          columnSuggestions = sampleColumns.map(column => ({
            label: column,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: column,
            range: range,
            detail: 'Column (sample)'
          }));
        }
        
        // Context-aware suggestions
        let contextSuggestions: any[] = [];
        
        // After FROM or JOIN, suggest tables
        if (/\b(FROM|JOIN)\s+[^,\s]*$/i.test(textUntilPosition)) {
          contextSuggestions = tableSuggestions;
        }
        // After SELECT, WHERE, GROUP BY, ORDER BY, suggest columns
        else if (/\b(SELECT|WHERE|GROUP\s+BY|ORDER\s+BY|ON|HAVING|SET)\s+[^,\s]*$/i.test(textUntilPosition) || 
                /\b(SELECT|WHERE|GROUP\s+BY|ORDER\s+BY|ON|HAVING|SET)\b.*,\s*[^,\s]*$/i.test(textUntilPosition)) {
          contextSuggestions = columnSuggestions;
        }
        // After period, suggest columns for the specified table
        else if (textUntilPosition.match(/[a-zA-Z0-9_]+\.$/)) {
          const tablePrefix = textUntilPosition.match(/([a-zA-Z0-9_]+)\.$/)?.[1] || '';
          
          if (schemaInfo) {
            // Find table in schema that matches the prefix
            let foundColumns: any[] = [];
            
            for (const schemaName in schemaInfo) {
              if (schemaInfo[schemaName][tablePrefix]) {
                // We found the table
                const columns = schemaInfo[schemaName][tablePrefix];
                foundColumns = columns.map(columnInfo => ({
                  label: columnInfo.column,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: columnInfo.column,
                  range: range,
                  detail: `Column (${columnInfo.type}) from ${tablePrefix}`
                }));
              }
            }
            
            if (foundColumns.length > 0) {
              contextSuggestions = foundColumns;
            }
          }
        }

        // Return all suggestions
        return {
          suggestions: [
            ...keywordSuggestions,
            ...dataTypeSuggestions,
            ...tableSuggestions,
            ...columnSuggestions,
            ...contextSuggestions
          ]
        };
      }
    });

    // Add SQL token provider for syntax highlighting
    monaco.languages.setMonarchTokensProvider('sql', {
      defaultToken: '',
      tokenPostfix: '.sql',

      keywords: sqlKeywords.map(k => k.toLowerCase()),
      operators: [
        '=', '>', '<', '>=', '<=', '<>', '!=', '+', '-', '*', '/', '%', '&', '|', '^', '~'
      ],
      
      // Symbols and brackets
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      brackets: [
        { open: '(', close: ')', token: 'delimiter.parenthesis' }
      ],

      // Special identifiers
      builtinFunctions: [
        'count', 'min', 'max', 'avg', 'sum', 'current_timestamp', 'current_date'
      ],
      builtinVariables: ['true', 'false', 'null'],
      
      // String and comments
      tokenizer: {
        root: [
          { include: '@comments' },
          { include: '@whitespace' },
          { include: '@numbers' },
          { include: '@strings' },

          // Keywords
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@builtinFunctions': 'predefined',
              '@builtinVariables': 'variable',
              '@default': 'identifier'
            }
          }],

          // Delimiters
          [/[;,.]/, 'delimiter'],
          [/[(){}[\]]/, '@brackets'],

          // Operators
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }]
        ],

        // String handling
        strings: [
          [/'/, { token: 'string', next: '@string_single' }],
          [/"/, { token: 'string', next: '@string_double' }]
        ],
        string_single: [
          [/[^']+/, 'string'],
          [/''/, 'string'],
          [/'/, { token: 'string', next: '@pop' }]
        ],
        string_double: [
          [/[^"]+/, 'string'],
          [/""/, 'string'],
          [/"/, { token: 'string', next: '@pop' }]
        ],

        // Comment handling
        comments: [
          [/--+.*/, 'comment'],
          [/\/\*/, { token: 'comment.quote', next: '@comment' }]
        ],
        comment: [
          [/[^*/]+/, 'comment'],
          [/\*\//, { token: 'comment.quote', next: '@pop' }],
          [/./, 'comment']
        ],

        // Whitespace handling
        whitespace: [
          [/\s+/, 'white']
        ],

        // Number handling
        numbers: [
          [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number']
        ]
      }
    });
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
                formatOnType: true,
                formatOnPaste: true,
                suggestSelection: "first",
                quickSuggestions: true,
                acceptSuggestionOnEnter: "on",
                snippetSuggestions: "inline"
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