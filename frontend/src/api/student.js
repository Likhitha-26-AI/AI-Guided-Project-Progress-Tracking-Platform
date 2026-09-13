import client from './client'

export async function getGreeting() {
  const res = await client.get('/api/student/greeting')
  return res.data
}

export async function listProjects() {
  const res = await client.get('/api/student/projects')
  return res.data
}

export async function getProject(projectId) {
  const res = await client.get(`/api/student/projects/${projectId}`)
  return res.data
}

export async function createProjectManual(payload) {
  const res = await client.post('/api/student/projects/manual', payload)
  return res.data
}

export async function createProjectFromGithub(payload) {
  const res = await client.post('/api/student/projects/github', payload)
  return res.data
}

export function downloadReportUrl(projectId) {
  return `${client.defaults.baseURL}/api/student/projects/${projectId}/download/report`
}

export function downloadSlidesUrl(projectId) {
  return `${client.defaults.baseURL}/api/student/projects/${projectId}/download/slides`
}

export async function getMyFeedback() {
  const res = await client.get('/api/student/feedback')
  return res.data
}

export async function getUnreadFeedbackCount() {
  const res = await client.get('/api/student/feedback/unread-count')
  return res.data
}

export async function getProjectComments(projectId) {
  const res = await client.get(`/api/student/projects/${projectId}/comments`)
  return res.data
}

export async function getInsights() {
  const res = await client.get('/api/student/insights')
  return res.data
}

export async function getActivity() {
  const res = await client.get('/api/student/activity')
  return res.data
}

export async function getTasks() {
  const res = await client.get('/api/student/tasks')
  return res.data
}

export async function toggleTask(taskId) {
  const res = await client.patch(`/api/student/tasks/${taskId}`)
  return res.data
}