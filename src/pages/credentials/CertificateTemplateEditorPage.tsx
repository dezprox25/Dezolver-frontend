import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCertificateTemplate,
  useCreateCertificateTemplate,
  useUpdateCertificateTemplate,
  usePreviewTemplate,
} from '@/hooks/useCertificateTemplates'
import { CertificateTemplateEditor } from '@/components/credentials/CertificateTemplateEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { TEMPLATE_VARIABLES } from '@/types/certificate.types'

const DEFAULT_HTML = `<div class="certificate">
  <h1>Certificate of Achievement</h1>
  <p class="awarded-to">Awarded to</p>
  <h2 class="recipient">{{recipientName}}</h2>
  <p class="achievement">{{achievementTitle}}</p>
  <p class="date">Issued on {{issuedAt}}</p>
  <p class="id">{{certificateId}}</p>
  <img src="{{verificationQrDataUrl}}" alt="QR Code" class="qr" />
</div>`

const DEFAULT_CSS = `.certificate {
  font-family: 'Georgia', serif;
  text-align: center;
  padding: 60px 80px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
h1 { color: #333; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
.awarded-to { color: #666; font-size: 14px; margin: 20px 0 5px; }
.recipient { color: #2c3e50; font-size: 36px; font-style: italic; margin: 0; }
.achievement { color: #555; font-size: 18px; margin: 15px 0; }
.date { color: #888; font-size: 13px; }
.id { font-family: monospace; color: #999; font-size: 12px; }
.qr { width: 80px; height: 80px; margin-top: 20px; }`

export function CertificateTemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const { data: existing, isLoading } = useCertificateTemplate(isNew ? undefined : id)
  const { mutateAsync: create, isPending: creating } = useCreateCertificateTemplate()
  const { mutateAsync: update, isPending: updating } = useUpdateCertificateTemplate()
  const { mutateAsync: previewPdf, isPending: previewing } = usePreviewTemplate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [css, setCss] = useState(DEFAULT_CSS)
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4')
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')

  useEffect(() => {
    if (!existing) return
    setName(existing.name)
    setDescription(existing.description ?? '')
    setHtml(existing.bodyHtml)
    setCss(existing.bodyCss)
    setPageSize(existing.pageSize)
    setOrientation(existing.pageOrientation)
  }, [existing])

  const sampleVars = Object.fromEntries(
    TEMPLATE_VARIABLES.map((v) => [v.name, `[${v.name}]`])
  )

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Template name is required.'); return }
    const dto = {
      name: name.trim(),
      description: description || undefined,
      bodyHtml: html,
      bodyCss: css,
      pageSize,
      pageOrientation: orientation,
    }
    try {
      if (isNew) {
        const t = await create(dto)
        toast.success('Template saved.')
        navigate(`/platform/credentials/templates/${t.id}/edit`, { replace: true })
      } else {
        await update({ id: id!, dto })
        toast.success('Template updated.')
      }
    } catch {
      toast.error('Save failed.')
    }
  }

  const handlePreviewPdf = async () => {
    if (!id || isNew) { toast.error('Save the template first.'); return }
    try {
      const res = await previewPdf({ id, dto: { variables: sampleVars } })
      window.open(res.previewUrl, '_blank', 'noopener')
    } catch {
      toast.error('Preview generation failed.')
    }
  }

  const isPending = creating || updating

  if (!isNew && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[500px] rounded" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-6 py-3 shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/platform/credentials/templates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <Input
              className="h-7 text-sm font-semibold border-0 bg-transparent p-0 focus-visible:ring-0 w-64"
              placeholder="Template name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isNew && (
            <Button variant="outline" size="sm" onClick={handlePreviewPdf} disabled={previewing}>
              {previewing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="mr-2 h-3.5 w-3.5" />}
              Preview PDF
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* Main: settings sidebar + editor */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Settings pane */}
        <div className="w-56 shrink-0 border-r overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-xs uppercase tracking-wide">Page</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Size</Label>
                <Select value={pageSize} onValueChange={(v) => setPageSize(v as 'A4' | 'Letter')}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Orientation</Label>
                <Select value={orientation} onValueChange={(v) => setOrientation(v as 'landscape' | 'portrait')}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              className="mt-1 text-xs h-20 resize-none"
              placeholder="Optional notes…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <CertificateTemplateEditor
            html={html}
            css={css}
            onHtmlChange={setHtml}
            onCssChange={setCss}
          />
        </div>
      </div>
    </div>
  )
}
