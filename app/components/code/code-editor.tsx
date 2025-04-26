'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import the Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
  height?: string | number;
  options?: any;
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  className,
  height = '100%',
  options = {},
}: CodeEditorProps) {
  return (
    <MonacoEditor
      height={height}
      defaultLanguage={language}
      value={value}
      onChange={(value) => onChange(value || '')}
      theme="vs-dark"
      className={cn('w-full overflow-hidden', className)}
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: false,
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
        ...options,
      }}
    />
  );
} 