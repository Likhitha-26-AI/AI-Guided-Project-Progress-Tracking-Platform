import { useEffect, useState } from 'react'
import { Github, Mail, User as UserIcon, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import Button from '../components/common/Button'
import { useAuth } from '../context/AuthContext'
import { fetchMe } from '../api/auth'
import { getGithubConnectUrl } from '../api/github'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('github') === 'connected') {
      fetchMe().then((freshUser) => {
        updateUser(freshUser)
        window.history.replaceState({}, '', '/student/settings')
      })
    }
  }, [])

  const handleConnectGithub = async () => {
    setConnecting(true)
    const url = await getGithubConnectUrl()
    window.location.href = url
  }

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-faint">Your account details.</p>

      <div className="mt-6 max-w-lg space-y-4 rounded-xl2 border border-periwinkle-100 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-periwinkle-100 text-periwinkle-600">
            <UserIcon size={18} />
          </span>
          <div>
            <p className="text-xs text-ink-faint">Name</p>
            <p className="text-sm font-semibold text-ink">{user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-periwinkle-100 text-periwinkle-600">
            <Mail size={18} />
          </span>
          <div>
            <p className="text-xs text-ink-faint">Email</p>
            <p className="text-sm font-semibold text-ink">{user?.email}</p>
          </div>
        </div>

        {user?.role === 'student' && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-periwinkle-100 text-periwinkle-600">
                <Github size={18} />
              </span>
              <div>
                <p className="text-xs text-ink-faint">GitHub</p>
                {user?.github_username ? (
                  <p className="flex items-center gap-1 text-sm font-semibold text-sage-700">
                    <CheckCircle2 size={14} /> @{user.github_username} connected
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-ink">Not connected</p>
                )}
              </div>
            </div>
            {!user?.github_username && (
              <Button variant="secondary" onClick={handleConnectGithub} disabled={connecting}>
                <Github size={14} /> {connecting ? 'Redirecting…' : 'Connect'}
              </Button>
            )}
          </div>
        )}

        <div className="pt-2">
          <span className="inline-block rounded-full bg-panel px-3 py-1 text-xs font-semibold capitalize text-ink-soft">
            {user?.role} account
          </span>
        </div>
      </div>
    </AppShell>
  )
}