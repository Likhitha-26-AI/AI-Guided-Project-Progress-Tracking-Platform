import { useState } from 'react'
import { Send } from 'lucide-react'
import { Select, Textarea } from '../common/Input'
import Button from '../common/Button'

const AGENT_OPTIONS = [
  { value: '', label: 'General comment' },
  { value: 'idea_evaluation', label: 'Idea Evaluation' },
  { value: 'scope', label: 'Scope Definition' },
  { value: 'tech', label: 'Tech Recommendation' },
  { value: 'timeline', label: 'Timeline Planning' },
  { value: 'risk', label: 'Risk Assessment' },
]

export default function AddCommentForm({ onSubmit }) {
  const [content, setContent] = useState('')
  const [agentKey, setAgentKey] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(content.trim(), agentKey || null)
      setContent('')
      setAgentKey('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl2 border border-periwinkle-100 bg-white p-4 shadow-soft">
      <p className="mb-2 text-sm font-semibold text-ink">Leave feedback</p>
      <Select value={agentKey} onChange={(e) => setAgentKey(e.target.value)} className="mb-2">
        {AGENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Share guidance, praise a good decision, or flag a concern…"
      />
      <div className="mt-2 flex justify-end">
        <Button type="submit" disabled={!content.trim() || submitting}>
          <Send size={14} /> {submitting ? 'Sending…' : 'Send feedback'}
        </Button>
      </div>
    </form>
  )
}