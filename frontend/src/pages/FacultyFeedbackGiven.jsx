import { useEffect, useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import CommentThread from '../components/Feedback/CommentThread'
import { getFeedbackGiven } from '../api/faculty'

export default function FacultyFeedbackGiven() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFeedbackGiven().then((data) => {
      setComments(data)
      setLoading(false)
    })
  }, [])

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <MessagesSquare size={22} className="text-periwinkle-600" />
        <h1 className="font-display text-2xl font-semibold text-ink">Feedback Given</h1>
      </div>
      <p className="mt-1 text-sm text-ink-faint">A history of every comment you've left on student projects.</p>

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
            emptyText="You haven't left any feedback yet — visit a student's project to get started."
          />
        )}
      </div>
    </AppShell>
  )
}