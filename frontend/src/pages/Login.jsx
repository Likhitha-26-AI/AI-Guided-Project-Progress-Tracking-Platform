import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Field, Input } from '../components/common/Input'
import Button from '../components/common/Button'
import { Spinner } from '../components/common/Loaders'
import WelcomePanel from '../components/Welcome/WelcomePanel'
import { login as loginApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginApi({ email, password })
      login(data.access_token, data.user)
      navigate(data.user.role === 'faculty' ? '/faculty' : '/student')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not log in. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <WelcomePanel />

      <div className="flex items-center justify-center bg-paper px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:hidden">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-periwinkle-500 text-white shadow-lift">
              <Sparkles size={22} />
            </span>
          </div>
          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-faint">
              Sign in to continue with your project mentorship.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl2 border border-periwinkle-100 bg-white p-7 shadow-soft"
          >
            {error && (
              <div className="rounded-xl border border-coral-100 bg-coral-100/50 px-4 py-2.5 text-sm text-coral-700">
                {error}
              </div>
            )}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Spinner className="h-4 w-4" /> : <ArrowRight size={16} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-faint">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-periwinkle-600 hover:text-periwinkle-700">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}