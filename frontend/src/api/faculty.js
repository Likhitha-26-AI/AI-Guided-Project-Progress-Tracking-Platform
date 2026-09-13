import client from './client'

export async function getFacultyGreeting() {
  const res = await client.get('/api/faculty/greeting')
  return res.data
}

export async function getFacultyOverview() {
  const res = await client.get('/api/faculty/overview')
  return res.data
}

export async function getStudentProject(projectId) {
  const res = await client.get(`/api/faculty/projects/${projectId}`)
  return res.data
}

export async function getProjectComments(projectId) {
  const res = await client.get(`/api/faculty/projects/${projectId}/comments`)
  return res.data
}

export async function addComment(projectId, content, agentKey = null) {
  const res = await client.post(`/api/faculty/projects/${projectId}/comments`, {
    content,
    agent_key: agentKey,
  })
  return res.data
}

export async function getFeedbackGiven() {
  const res = await client.get('/api/faculty/feedback-given')
  return res.data
}

export async function getCohortInsights() {
  const res = await client.get('/api/faculty/insights')
  return res.data
}