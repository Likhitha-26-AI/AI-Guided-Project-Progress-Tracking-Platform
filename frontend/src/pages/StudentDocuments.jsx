import { useEffect, useState } from 'react'
import { FileText, Presentation, FolderOpen } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import Button from '../components/common/Button'
import { listProjects, downloadReportUrl, downloadSlidesUrl } from '../api/student'
import client from '../api/client'

export default function StudentDocuments() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    listProjects().then((data) => {
      setProjects(data.filter((p) => p.status === 'blueprint_ready' || p.status === 'completed'))
      setLoading(false)
    })
  }, [])

  const handleDownload = async (url, filename, key) => {
    setDownloading(key)
    try {
      const res = await client.get(url.replace(client.defaults.baseURL, ''), { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      setDownloading(null)
    }
  }

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <FolderOpen size={22} className="text-periwinkle-600" />
        <h1 className="font-display text-2xl font-semibold text-ink">Documents</h1>
      </div>
      <p className="mt-1 text-sm text-ink-faint">
        Download a Word report or slide deck for any project with a finished blueprint.
      </p>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl2 bg-panel" />
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 p-10 text-center">
            <p className="text-sm text-ink-soft">
              No documents ready yet — once a project's blueprint finishes, its report and
              slides will be downloadable here.
            </p>
          </div>
        )}

        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 rounded-xl2 border border-periwinkle-100 bg-white p-5 shadow-soft"
          >
            <div>
              <h3 className="font-display text-base font-semibold text-ink">{p.title}</h3>
              <p className="text-xs text-ink-faint">
                {p.domain ? `${p.domain} · ` : ''}
                {p.expected_timeline_weeks ? `${p.expected_timeline_weeks} weeks` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={downloading === `${p.id}-report`}
                onClick={() => handleDownload(downloadReportUrl(p.id), `${p.title}_report.docx`, `${p.id}-report`)}
              >
                <FileText size={15} /> {downloading === `${p.id}-report` ? 'Preparing…' : 'Report'}
              </Button>
              <Button
                variant="secondary"
                disabled={downloading === `${p.id}-slides`}
                onClick={() => handleDownload(downloadSlidesUrl(p.id), `${p.title}_slides.pptx`, `${p.id}-slides`)}
              >
                <Presentation size={15} /> {downloading === `${p.id}-slides` ? 'Preparing…' : 'Slides'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}