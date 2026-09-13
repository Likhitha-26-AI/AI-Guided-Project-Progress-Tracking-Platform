import ReactMarkdown from 'react-markdown'

export default function AgentMarkdown({ content }) {
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-ink-soft">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h3 className="mt-3 font-display text-base font-semibold text-ink first:mt-0">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-3 font-display text-base font-semibold text-ink first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-2 text-sm font-semibold text-periwinkle-700">{children}</h4>
          ),
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          ul: ({ children }) => <ul className="ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          hr: () => <hr className="my-3 border-periwinkle-100" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}