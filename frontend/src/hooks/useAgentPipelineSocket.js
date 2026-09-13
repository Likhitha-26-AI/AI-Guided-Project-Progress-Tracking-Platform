import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_BASE_URL } from '../api/client'

/**
 * Opens a WebSocket to /ws/projects/{projectId} and tracks live agent
 * status updates as they're pushed from the backend. This is what makes
 * the pipeline appear on screen in real time instead of a blind poll.
 */
export function useAgentPipelineSocket(projectId, onComplete) {
  const [events, setEvents] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    if (!projectId) return
    const token = localStorage.getItem('access_token')
    const ws = new WebSocket(`${WS_BASE_URL}/ws/projects/${projectId}?token=${token}`)
    socketRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'pipeline_complete') {
          onComplete && onComplete()
          return
        }
        setEvents((prev) => [...prev, data])
      } catch {
        // ignore malformed frames
      }
    }

    ws.onerror = () => {
      // Connection issues are surfaced via the pipeline UI falling back to
      // "pending" state — no need to crash the page.
    }

    return () => {
      ws.close()
    }
  }, [projectId])

  return events
}
