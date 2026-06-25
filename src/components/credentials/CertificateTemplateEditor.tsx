import { useState } from 'react'
import { CodeEditor } from '@/components/assessment/CodeEditor'
import { CertificateTemplatePreview } from './CertificateTemplatePreview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TEMPLATE_VARIABLES } from '@/types/certificate.types'

interface CertificateTemplateEditorProps {
  html: string
  css: string
  onHtmlChange: (v: string) => void
  onCssChange: (v: string) => void
  readOnly?: boolean
}

export function CertificateTemplateEditor({
  html,
  css,
  onHtmlChange,
  onCssChange,
  readOnly = false,
}: CertificateTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'preview' | 'vars'>('html')

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex flex-col flex-1 min-h-0"
      >
        <TabsList className="shrink-0 rounded-none border-b h-9">
          <TabsTrigger value="html" className="rounded-none text-xs">HTML</TabsTrigger>
          <TabsTrigger value="css" className="rounded-none text-xs">CSS</TabsTrigger>
          <TabsTrigger value="preview" className="rounded-none text-xs">Preview</TabsTrigger>
          <TabsTrigger value="vars" className="rounded-none text-xs">Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="html" className="flex-1 min-h-0 mt-0">
          <CodeEditor
            value={html}
            language="html"
            onChange={onHtmlChange}
            readOnly={readOnly}
            height="100%"
            className="h-full"
          />
        </TabsContent>

        <TabsContent value="css" className="flex-1 min-h-0 mt-0">
          <CodeEditor
            value={css}
            language="css"
            onChange={onCssChange}
            readOnly={readOnly}
            height="100%"
            className="h-full"
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 overflow-auto mt-0 p-4">
          <CertificateTemplatePreview html={html} css={css} />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Local preview. Mustache variables shown as-is.
            Use the <strong>Preview PDF</strong> button for a server-rendered preview.
          </p>
        </TabsContent>

        <TabsContent value="vars" className="flex-1 mt-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Supported Template Variables
              </p>
              <p className="text-xs text-muted-foreground">
                Use Mustache syntax: <code className="font-mono bg-muted px-1 rounded">{'{{variableName}}'}</code>
              </p>
              <div className="space-y-2">
                {TEMPLATE_VARIABLES.map((v) => (
                  <div
                    key={v.name}
                    className="flex items-start gap-3 rounded-md border px-3 py-2"
                  >
                    <Badge
                      variant="secondary"
                      className="font-mono text-[11px] shrink-0 cursor-pointer select-all"
                      onClick={() => {
                        navigator.clipboard?.writeText(`{{${v.name}}}`)
                      }}
                      title="Click to copy"
                    >
                      {`{{${v.name}}}`}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{v.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
