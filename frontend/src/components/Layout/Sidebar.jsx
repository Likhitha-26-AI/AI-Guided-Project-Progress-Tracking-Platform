import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, FolderKanban, Plus, Radar, MessageSquareText, MessagesSquare,
  Settings as SettingsIcon, Users, AlertTriangle, Sparkles, ListChecks, FolderOpen,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getUnreadFeedbackCount } from '../../api/student'

const STUDENT_NAV = [
  { to: '/student', label: 'Home', icon: Home, end: true },
  { to: '/student/projects', label: 'My Projects', icon: FolderKanban },
  { to: '/student/new-project', label: 'New Project', icon: Plus },
  { to: '/student/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/student/insights', label: 'Insights', icon: Radar },
  { to: '/student/documents', label: 'Documents', icon: FolderOpen },
  { to: '/student/feedback', label: 'Feedback', icon: MessageSquareText, badgeKey: 'feedback' },
  { to: '/student/settings', label: 'Settings', icon: SettingsIcon },
]

const FACULTY_NAV = [
  { to: '/faculty', label: 'Home', icon: Home, end: true },
  { to: '/faculty/students', label: 'All Students', icon: Users },
  { to: '/faculty/needs-attention', label: 'Needs Attention', icon: AlertTriangle },
  { to: '/faculty/insights', label: 'Insights', icon: Radar },
  { to: '/faculty/feedback-given', label: 'Feedback Given', icon: MessagesSquare },
  { to: '/faculty/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const { user } = useAuth()
  const [unreadFeedback, setUnreadFeedback] = useState(0)
  const items = user?.role === 'faculty' ? FACULTY_NAV : STUDENT_NAV

  useEffect(() => {
    if (user?.role === 'student') {
      getUnreadFeedbackCount().then((d) => setUnreadFeedback(d.unread_count)).catch(() => {})
    }
  }, [user])

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex h-screen w-64 shrink-0 flex-col border-r border-periwinkle-100 bg-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-periwinkle-500 text-white">
          <Sparkles size={16} />
        </span>
        <span className="font-display text-lg font-semibold text-ink">Project Mentor</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map(({ to, label, icon: Icon, end, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-periwinkle-100 text-periwinkle-700'
                  : 'text-ink-soft hover:bg-panel hover:text-ink'
              }`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            {badgeKey === 'feedback' && unreadFeedback > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
                {unreadFeedback}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-periwinkle-100 p-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-panel px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-periwinkle-500 text-xs font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="text-xs capitalize text-ink-faint">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}