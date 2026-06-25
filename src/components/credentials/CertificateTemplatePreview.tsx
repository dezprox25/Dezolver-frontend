interface CertificateTemplatePreviewProps {
  html: string
  css: string
}

/**
 * Renders an HTML+CSS certificate template in a sandboxed iframe.
 * This is a local preview only — the backend PDF preview (via POST /preview)
 * may differ in rendering.
 */
export function CertificateTemplatePreview({ html, css }: CertificateTemplatePreviewProps) {
  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;} ${css}</style></head><body>${html}</body></html>`
  const srcDoc = doc

  return (
    <div className="relative w-full aspect-[1.414/1] bg-white rounded-lg border overflow-hidden shadow-sm">
      <iframe
        srcDoc={srcDoc}
        title="Template preview"
        className="absolute inset-0 w-full h-full border-0"
        sandbox="allow-same-origin"
        aria-label="Certificate template preview"
      />
    </div>
  )
}
