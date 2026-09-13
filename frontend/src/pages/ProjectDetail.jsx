import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FolderOpen } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import AgentPipeline from '../components/AgentPipeline/AgentPipeline'
import AgentResponsePanel from '../components/AgentResponse/AgentResponsePanel'
import ProjectMentorChat from '../components/FloatingChat/ProjectMentorChat'
import { getProject } from '../api/student'
import { useAgentPipelineSocket } from '../hooks/useAgentPipelineSocket'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [selectedAgent, setSelectedAgent] = useState(null)

  const handlePipelineComplete = useCallback(() => {
    setRefreshTick((t) => t + 1)
  }, [])

  const liveEvents = useAgentPipelineSocket(projectId, handlePipelineComplete)

  useEffect(() => {
    getProject(projectId).then(setProject)
  }, [projectId, refreshTick])

  // Keep the response panel's content fresh as live updates come in —
  // if the currently viewed agent gets a new output, refresh it.
  useEffect(() => {
    if (!selectedAgent || !project) return
    const updated = project.agent_runs.find((r) => r.agent_key === selectedAgent.agent_key)
    if (updated && updated.output_text !== selectedAgent.output_text) {
      setSelectedAgent(updated)
    }
  }, [project])

  if (!project) {
    return (
      <AppShell>
        <div className="h-40 animate-pulse rounded-xl2 bg-panel" />
      </AppShell>
    )
  }

  const blueprintReady = project.status === 'blueprint_ready' || project.status === 'completed'

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{project.title}</h1>
          <p className="text-sm text-ink-faint">
            {project.domain ? `${project.domain} · ` : ''}
            {project.team_size ? `Team of ${project.team_size} · ` : ''}
            {project.expected_timeline_weeks ? `${project.expected_timeline_weeks} weeks` : ''}
          </p>
        </div>
        {blueprintReady && (
          <Link
            to="/student/documents"
            className="flex items-center gap-1.5 rounded-full border border-periwinkle-200 px-4 py-2 text-sm font-medium text-periwinkle-700 hover:border-periwinkle-400"
          >
            <FolderOpen size={15} /> Get report & slides
          </Link>
        )}
      </div>

      {project.idea_text && (
        <p className="mb-6 rounded-xl2 border border-periwinkle-100 bg-panel/50 p-4 text-sm italic text-ink-soft">
          "{project.idea_text}"
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <AgentPipeline
          agentRuns={project.agent_runs}
          liveEvents={liveEvents}
          selectedAgentKey={selectedAgent?.agent_key}
          onSelectAgent={setSelectedAgent}
        />
        <div className="h-[600px] lg:sticky lg:top-6">
          <AgentResponsePanel selectedAgent={selectedAgent} />
        </div>
      </div>
      <ProjectMentorChat projectId={project.id} />
    </AppShell>
  )
}