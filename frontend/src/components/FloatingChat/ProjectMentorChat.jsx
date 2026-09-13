import { useEffect, useState } from 'react'
import FloatingChatWidget from './FloatingChatWidget'
import { getMessages, sendMessage, checkProactiveNudge } from '../../api/chat'

export default function ProjectMentorChat({ projectId }) {
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!projectId) return
    getMessages(projectId).then(setMessages)
    checkProactiveNudge(projectId).then((res) => {
      if (res.nudge) setMessages((prev) => [...prev, res.nudge])
    })
  }, [projectId])

  const handleSend = async (content) => {
    setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, sender: 'user', content }])
    setSending(true)
    try {
      const aiReply = await sendMessage(projectId, content)
      setMessages((prev) => [...prev, aiReply])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, sender: 'ai', content: "I couldn't reach the AI model just now — please try again." },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <FloatingChatWidget
      title="AI Mentor Chat"
      teaser="Say hello — your mentor is ready to help with anything about this project."
      messages={messages}
      onSend={handleSend}
      sending={sending}
      placeholder="Ask your mentor a question…"
    />
  )
}