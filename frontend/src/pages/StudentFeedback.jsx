import { useEffect, useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import CommentThread from '../components/Feedback/CommentThread'
import { getMyFeedback } from '../api/student'

export default function StudentFeedback() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyFeedback().then((data) => {
      setComments(data)
      setLoading(false)
    })
  }, [])

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <MessageSquareText size={22} className="text-periwinkle-600" />
        <h1 className="font-display text-2xl font-semibold text-ink">Feedback</h1>
      </div>
      <p className="mt-1 text-sm text-ink-faint">Everything your mentor has shared, across all your projects.</p>

      <div className="mt-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl2 bg-panel" />
            ))}
          </div>
        )}
        {!loading && (
          <CommentThread
            comments={comments}
            emptyText="No feedback yet — once your mentor comments on a project, it'll show up here."
          />
        )}
      </div>
    </AppShell>
  )
}