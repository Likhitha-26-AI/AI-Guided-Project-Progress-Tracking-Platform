import { useNavigate } from 'react-router-dom'
import AppShell from '../components/Layout/AppShell'
import NewProjectForm from '../components/ProjectForm/NewProjectForm'
import IdeaBrainstormChat from '../components/FloatingChat/IdeaBrainstormChat'
import { useAuth } from '../context/AuthContext'

export default function NewProject() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const githubConnected = Boolean(user?.github_username)

  const handleCreated = (project) => {
    navigate(`/student/projects/${project.id}`)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Tell us about your project</h1>
        <p className="mb-6 text-sm text-ink-faint">
          Your AI mentor team will evaluate it, define scope, suggest a tech stack, plan a
          timeline, and flag risks — live, right after you submit.
        </p>
        <NewProjectForm onCreated={handleCreated} githubConnected={githubConnected} />
      </div>
      <IdeaBrainstormChat />
    </AppShell>
  )
}