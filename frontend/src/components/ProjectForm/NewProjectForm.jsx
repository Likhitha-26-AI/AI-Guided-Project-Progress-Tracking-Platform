import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Github, Sparkles, ArrowRight } from 'lucide-react'
import { Field, Input, Textarea, Select } from '../common/Input'
import Button from '../common/Button'
import { Spinner } from '../common/Loaders'
import { getGithubConnectUrl, listGithubRepos } from '../../api/github'
import { createProjectManual, createProjectFromGithub } from '../../api/student'

const DOMAINS = [
  'Web Development',
  'Mobile App Development',
  'AI / Machine Learning',
  'Data Science & Analytics',
  'IoT & Embedded Systems',
  'Cybersecurity',
  'Cloud Computing',
  'Blockchain',
  'Game Development',
  'Other',
]

export default function NewProjectForm({ onCreated, githubConnected }) {
  const [mode, setMode] = useState('manual') // 'manual' | 'github'
  const [title, setTitle] = useState('')
  const [ideaText, setIdeaText] = useState('')
  const [domain, setDomain] = useState(DOMAINS[0])
  const [teamSize, setTeamSize] = useState(1)
  const [timelineWeeks, setTimelineWeeks] = useState(8)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [repos, setRepos] = useState([])
  const [reposLoading, setReposLoading] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState('')

  useEffect(() => {
    if (mode === 'github' && githubConnected && repos.length === 0) {
      setReposLoading(true)
      listGithubRepos()
        .then(setRepos)
        .catch(() => setError('Could not load your GitHub repositories.'))
        .finally(() => setReposLoading(false))
    }
  }, [mode, githubConnected])

  const handleConnectGithub = async () => {
    const url = await getGithubConnectUrl()
    window.location.href = url
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (ideaText.trim().length < 10) {
      setError('Tell us a bit more about your idea (at least a couple of sentences).')
      return
    }
    setSubmitting(true)
    try {
      const project = await createProjectManual({
        title,
        idea_text: ideaText,
        domain,
        team_size: Number(teamSize),
        expected_timeline_weeks: Number(timelineWeeks),
      })
      onCreated(project)
    } catch {
      setError('Something went wrong creating your project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGithubSubmit = async () => {
    if (!selectedRepo) return
    setError('')
    setSubmitting(true)
    const repo = repos.find((r) => r.full_name === selectedRepo)
    try {
      const project = await createProjectFromGithub({
        repo_full_name: repo.full_name,
        repo_url: repo.url,
        title: repo.name,
      })
      onCreated(project)
    } catch {
      setError('Something went wrong importing this repository. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl2 border border-periwinkle-100 bg-white p-7 shadow-soft"
    >
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-periwinkle-100 text-periwinkle-600">
          <Sparkles size={16} />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">Start a new project</h2>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 inline-flex rounded-full bg-panel p-1">
        <button
          onClick={() => setMode('manual')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === 'manual' ? 'bg-white text-ink shadow-sm' : 'text-ink-faint'
          }`}
        >
          Describe my idea
        </button>
        <button
          onClick={() => setMode('github')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === 'github' ? 'bg-white text-ink shadow-sm' : 'text-ink-faint'
          }`}
        >
          <Github size={14} /> Import from GitHub
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-coral-100 bg-coral-100/50 px-4 py-2.5 text-sm text-coral-700">
          {error}
        </div>
      )}

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="space-y-5">
          <Field label="Project title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smart Campus Navigation App"
              required
            />
          </Field>

          <Field label="Describe your idea" hint="2-3 lines is perfect">
            <Textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              rows={4}
              placeholder="What problem does it solve, and how?"
              required
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Domain">
              <Select value={domain} onChange={(e) => setDomain(e.target.value)}>
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </Field>
            <Field label="Team size">
              <Input
                type="number"
                min={1}
                max={20}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                required
              />
            </Field>
            <Field label="Expected timeline (weeks)">
              <Input
                type="number"
                min={1}
                max={52}
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(e.target.value)}
                required
              />
            </Field>
          </div>

          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? <Spinner className="h-4 w-4" /> : <ArrowRight size={16} />}
            {submitting ? 'Sending to your AI mentors…' : 'Get my project blueprint'}
          </Button>
        </form>
      ) : (
        <div className="space-y-5">
          {!githubConnected ? (
            <div className="rounded-xl2 border border-dashed border-periwinkle-200 bg-panel/60 p-6 text-center">
              <p className="mb-4 text-sm text-ink-soft">
                Connect your GitHub account to pick an existing repository as your project.
              </p>
              <Button onClick={handleConnectGithub} variant="secondary">
                <Github size={16} /> Connect GitHub
              </Button>
            </div>
          ) : reposLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6 text-periwinkle-400" />
            </div>
          ) : (
            <>
              <Field label="Choose a repository">
                <Select value={selectedRepo} onChange={(e) => setSelectedRepo(e.target.value)}>
                  <option value="">Select a repository…</option>
                  {repos.map((r) => (
                    <option key={r.full_name} value={r.full_name}>
                      {r.full_name} {r.language ? `· ${r.language}` : ''}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button onClick={handleGithubSubmit} disabled={!selectedRepo || submitting}>
                {submitting ? <Spinner className="h-4 w-4" /> : <ArrowRight size={16} />}
                {submitting ? 'Importing…' : 'Analyze this repository'}
              </Button>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
