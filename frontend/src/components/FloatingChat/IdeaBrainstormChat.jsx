import { useState } from 'react'
import FloatingChatWidget from './FloatingChatWidget'
import client from '../../api/client'

export default function IdeaBrainstormChat() {
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)

  const handleSend = async (content) => {
    const newMessages = [...messages, { sender: 'user', content }]
    setMessages(newMessages)
    setSending(true)
    try {
      const res = await client.post('/api/chat/brainstorm', {
        content,
        history: newMessages,
      })
      setMessages((prev) => [...prev, { sender: 'ai', content: res.data.content }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', content: "I couldn't reach the AI model just now — please try again." },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <FloatingChatWidget
      title="Idea Assistant"
      teaser="Still shaping your idea? Ask me anything — I can help you sharpen it before you submit."
      messages={messages}
      onSend={handleSend}
      sending={sending}
      placeholder="Ask about your idea…"
    />
  )
}