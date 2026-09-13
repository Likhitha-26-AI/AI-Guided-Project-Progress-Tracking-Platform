import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

export default function AppShell({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      {/* pl-64 offsets the fixed sidebar's width so content never sits under it */}
      <div className="pl-64">
        <header className="flex items-center justify-end border-b border-periwinkle-100 bg-paper/80 px-8 py-3 backdrop-blur">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-periwinkle-200 px-4 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-coral-500 hover:text-coral-700"
          >
            <LogOut size={13} />
            Log out
          </button>
        </header>
        <main className="mx-auto max-w-5xl px-8 py-8">{children}</main>
      </div>
    </div>
  )
}