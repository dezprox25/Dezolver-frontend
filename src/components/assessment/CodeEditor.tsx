import { useRef } from 'react'
import MonacoEditor, { type OnMount } from '@monaco-editor/react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CodeEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
  onPaste?: () => void
  readOnly?: boolean
  className?: string
  height?: string
}

export function CodeEditor({
  value,
  language,
  onChange,
  onPaste,
  readOnly = false,
  className,
  height = '100%',
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor

    // Track paste events for anti-cheat
    if (onPaste) {
      editor.onDidPaste(() => onPaste())
    }

    // Focus the editor
    editor.focus()
  }

  return (
    <div className={cn('overflow-hidden rounded-md border bg-[#1e1e1e]', className)}>
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        loading={
          <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          tabSize: 4,
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 4,
          automaticLayout: true,
          contextmenu: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderLineHighlight: 'line',
          suggest: { showKeywords: true },
          bracketPairColorization: { enabled: true },
        }}
        theme="vs-dark"
      />
    </div>
  )
}
