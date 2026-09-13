import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { TypingDots } from '../common/Loaders'

/**
 * Generic floating chat bubble — bottom-right button that expands into a
 * popup panel. The actual message list, sending logic, and persistence are
 * owned by the parent (IdeaBrainstormChat, ProjectMentorChat, etc.) — this
 * component is purely the shell + interaction.
 */
export default function FloatingChatWidget({ title, teaser, messages, onSend, sending, placeholder }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending, open])

  const handleSend = () => {
    const content = input.trim()
    if (!content || sending) return
    setInput('')
    onSend(content)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-3 flex h-[420px] w-80 flex-col overflow-hidden rounded-xl2 border border-periwinkle-100 bg-white shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-periwinkle-100 bg-periwinkle-50 px-4 py-3">
              <p className="text-sm font-semibold text-ink">{title}</p>
              <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink">
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
              {messages.length === 0 && (
                <p className="py-6 text-center text-xs text-ink-faint">{teaser}</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      m.sender === 'ai' ? 'bg-panel text-ink' : 'bg-periwinkle-500 text-white'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-1.5 pl-1 text-xs text-ink-faint">
                  <TypingDots />
                </div>
              )}
            </div>

            <div className="flex items-end gap-2 border-t border-periwinkle-100 p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={placeholder}
                className="max-h-20 flex-1 resize-none rounded-xl border border-periwinkle-200 bg-paper px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-periwinkle-400 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-periwinkle-500 text-white disabled:opacity-40"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 rounded-full bg-periwinkle-500 px-4 py-3 text-sm font-semibold text-white shadow-lift"
      >
        {open ? <X size={16} /> : <MessageCircle size={16} />}
        {!open && <span>Need help? Let's chat</span>}
      </motion.button>
    </div>
  )
}