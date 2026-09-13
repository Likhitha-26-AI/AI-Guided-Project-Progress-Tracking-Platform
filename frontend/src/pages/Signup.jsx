import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, GraduationCap, Users } from 'lucide-react'
import { Field, Input } from '../components/common/Input'
import Button from '../components/common/Button'
import { Spinner } from '../components/common/Loaders'
import WelcomePanel from '../components/Welcome/WelcomePanel'
import { signup as signupApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await signupApi({ name, email, password, role })
      login(data.access_token, data.user)
      navigate(role === 'faculty' ? '/faculty' : '/student')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not create your account. Please try again.')
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
            <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
            <p className="mt-1 text-sm text-ink-faint">
              Join as a student or a faculty mentor.
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

            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">I am a</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-colors ${
                    role === 'student'
                      ? 'border-periwinkle-500 bg-periwinkle-50 text-periwinkle-700'
                      : 'border-periwinkle-100 text-ink-faint hover:border-periwinkle-200'
                  }`}
                >
                  <GraduationCap size={20} /> Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-colors ${
                    role === 'faculty'
                      ? 'border-periwinkle-500 bg-periwinkle-50 text-periwinkle-700'
                      : 'border-periwinkle-100 text-ink-faint hover:border-periwinkle-200'
                  }`}
                >
                  <Users size={20} /> Faculty
                </button>
              </div>
            </div>

            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
              />
            </Field>
            <Field label="Password" hint="At least 6 characters">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Spinner className="h-4 w-4" /> : <ArrowRight size={16} />}
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-faint">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-periwinkle-600 hover:text-periwinkle-700">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}