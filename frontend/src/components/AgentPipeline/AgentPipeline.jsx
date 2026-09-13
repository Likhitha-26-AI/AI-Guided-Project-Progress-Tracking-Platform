import { useMemo } from 'react'
import AgentNode from './AgentNode'

const AGENT_ORDER = ['idea_evaluation', 'scope', 'tech', 'timeline', 'risk']
const AGENT_LABELS = {
  idea_evaluation: 'Idea Evaluation',
  scope: 'Scope Definition',
  tech: 'Tech Recommendation',
  timeline: 'Timeline Planning',
  risk: 'Risk Assessment',
}

/**
 * Merges the project's persisted agent_runs (from the initial fetch) with
 * live WebSocket events (status changes as they happen) into one ordered
 * list, so the pipeline is accurate whether you just loaded the page or
 * you're watching it run live.
 */
export default function AgentPipeline({ agentRuns = [], liveEvents = [], selectedAgentKey, onSelectAgent }) {
  const merged = useMemo(() => {
    const byKey = {}
    AGENT_ORDER.forEach((key, i) => {
      byKey[key] = {
        agent_key: key,
        agent_label: AGENT_LABELS[key],
        status: 'pending',
        output_text: null,
        order_index: i,
      }
    })

    agentRuns.forEach((run) => {
      if (byKey[run.agent_key]) {
        byKey[run.agent_key] = { ...byKey[run.agent_key], ...run }
      }
    })

    liveEvents.forEach((evt) => {
      if (evt.type !== 'agent_status' || !byKey[evt.agent_key]) return
      byKey[evt.agent_key] = {
        ...byKey[evt.agent_key],
        status: evt.status,
        output_text: evt.output || evt.error || byKey[evt.agent_key]?.output_text,
      }
    })

    return AGENT_ORDER.map((key) => byKey[key])
  }, [agentRuns, liveEvents])

  return (
    <div className="rounded-xl2 border border-periwinkle-100 bg-white p-6 shadow-soft">
      <h2 className="font-display text-xl font-semibold text-ink">Your AI mentor team</h2>
      <p className="mt-1 text-sm text-ink-faint">
        Five agents work through your idea in order — click any completed one to read its response.
      </p>
      <div className="mt-6">
        {merged.map((agent, i) => (
          <AgentNode
            key={agent.agent_key}
            agent={agent}
            isLast={i === merged.length - 1}
            isSelected={selectedAgentKey === agent.agent_key}
            onSelect={onSelectAgent}
          />
        ))}
      </div>
    </div>
  )
}