import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/Layout/ProtectedRoute'

import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import MyProjects from './pages/MyProjects'
import NewProject from './pages/NewProject'
import ProjectDetail from './pages/ProjectDetail'
import FacultyDashboard from './pages/FacultyDashboard'
import FacultyProjectView from './pages/FacultyProjectView'
import NeedsAttention from './pages/NeedsAttention'
import Settings from './pages/Settings'
import StudentFeedback from './pages/StudentFeedback'
import FacultyFeedbackGiven from './pages/FacultyFeedbackGiven'
import StudentInsights from './pages/StudentInsights'
import FacultyInsights from './pages/FacultyInsights'
import StudentTasks from './pages/StudentTasks'
import StudentDocuments from './pages/StudentDocuments'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'faculty' ? '/faculty' : '/student'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/projects" element={<ProtectedRoute role="student"><MyProjects /></ProtectedRoute>} />
          <Route path="/student/new-project" element={<ProtectedRoute role="student"><NewProject /></ProtectedRoute>} />
          <Route path="/student/projects/:projectId" element={<ProtectedRoute role="student"><ProjectDetail /></ProtectedRoute>} />
          <Route path="/student/insights" element={<ProtectedRoute role="student"><StudentInsights /></ProtectedRoute>} />
          <Route path="/student/tasks" element={<ProtectedRoute role="student"><StudentTasks /></ProtectedRoute>} />
          <Route path="/student/documents" element={<ProtectedRoute role="student"><StudentDocuments /></ProtectedRoute>} />
          <Route path="/student/feedback" element={<ProtectedRoute role="student"><StudentFeedback /></ProtectedRoute>} />
          <Route path="/student/settings" element={<ProtectedRoute role="student"><Settings /></ProtectedRoute>} />

          {/* Faculty routes */}
          <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty/students" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty/needs-attention" element={<ProtectedRoute role="faculty"><NeedsAttention /></ProtectedRoute>} />
          <Route path="/faculty/projects/:projectId" element={<ProtectedRoute role="faculty"><FacultyProjectView /></ProtectedRoute>} />
          <Route path="/faculty/insights" element={<ProtectedRoute role="faculty"><FacultyInsights /></ProtectedRoute>} />
          <Route path="/faculty/feedback-given" element={<ProtectedRoute role="faculty"><FacultyFeedbackGiven /></ProtectedRoute>} />
          <Route path="/faculty/settings" element={<ProtectedRoute role="faculty"><Settings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}