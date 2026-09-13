import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import ChatBubble from './ChatBubble'
import { TypingDots } from '../common/Loaders'
import { getMessages, sendMessage, checkProactiveNudge } from '../../api/chat'

export default function ChatPanel({ projectId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!projectId) return
    let mounted = true

    getMessages(projectId).then((data) => {
      if (!mounted) return
      setMessages(data)
      setLoaded(true)
    })

    checkProactiveNudge(projectId).then((res) => {
      if (!mounted || !res.nudge) return
      setMessages((prev) => [...prev, res.nudge])
    })

    return () => {
      mounted = false
    }
  }, [projectId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || sending) return

    setInput('')
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl2 border border-periwinkle-100 bg-white shadow-soft">
      <div className="border-b border-periwinkle-100 px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">AI Mentor Chat</h2>
        <p className="text-xs text-ink-faint">Ask anything about your project</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {!loaded && (
          <div className="flex justify-center py-8">
            <TypingDots />
          </div>
        )}
        {loaded && messages.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-faint">
            Say hello — your mentor is ready to help with anything about this project.
          </p>
        )}
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {sending && (
          <div className="flex items-center gap-2 pl-8 text-xs text-ink-faint">
            <TypingDots /> AI mentor is typing…
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 border-t border-periwinkle-100 p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask your mentor a question…"
          className="max-h-24 flex-1 resize-none rounded-xl border border-periwinkle-200 bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-periwinkle-400 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-periwinkle-500 text-white transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
