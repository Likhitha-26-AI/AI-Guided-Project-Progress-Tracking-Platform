import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/Layout/AppShell'
import AgentPipeline from '../components/AgentPipeline/AgentPipeline'
import AgentResponsePanel from '../components/AgentResponse/AgentResponsePanel'
import CommentThread from '../components/Feedback/CommentThread'
import AddCommentForm from '../components/Feedback/AddCommentForm'
import { getStudentProject, getProjectComments, addComment } from '../api/faculty'

export default function FacultyProjectView() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [comments, setComments] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)

  const loadComments = useCallback(() => {
    getProjectComments(projectId).then(setComments)
  }, [projectId])

  useEffect(() => {
    getStudentProject(projectId).then(setProject)
    loadComments()
  }, [projectId, loadComments])

  const handleAddComment = async (content, agentKey) => {
    await addComment(projectId, content, agentKey)
    loadComments()
  }

  if (!project) {
    return (
      <AppShell>
        <div className="h-40 animate-pulse rounded-xl2 bg-panel" />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">{project.title}</h1>
        <p className="text-sm text-ink-faint">
          {project.domain ? `${project.domain} · ` : ''}
          {project.team_size ? `Team of ${project.team_size} · ` : ''}
          {project.expected_timeline_weeks ? `${project.expected_timeline_weeks} weeks` : ''}
        </p>
      </div>

      {project.idea_text && (
        <p className="mb-6 rounded-xl2 border border-periwinkle-100 bg-panel/50 p-4 text-sm italic text-ink-soft">
          "{project.idea_text}"
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <AgentPipeline
          agentRuns={project.agent_runs}
          liveEvents={[]}
          selectedAgentKey={selectedAgent?.agent_key}
          onSelectAgent={setSelectedAgent}
        />

        <div className="space-y-4">
          {selectedAgent && (
            <div className="h-80">
              <AgentResponsePanel selectedAgent={selectedAgent} />
            </div>
          )}
          <h2 className="font-display text-lg font-semibold text-ink">Your feedback</h2>
          <AddCommentForm onSubmit={handleAddComment} />
          <CommentThread comments={comments} emptyText="You haven't left feedback on this project yet." />
        </div>
      </div>
    </AppShell>
  )
}