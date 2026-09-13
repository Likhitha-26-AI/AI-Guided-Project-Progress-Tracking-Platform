import client from './client'

export async function getMessages(projectId) {
  const res = await client.get(`/api/chat/${projectId}/messages`)
  return res.data
}

export async function sendMessage(projectId, content) {
  const res = await client.post(`/api/chat/${projectId}/messages`, { content })
  return res.data
}

export async function checkProactiveNudge(projectId) {
  const res = await client.get(`/api/chat/${projectId}/proactive-check`)
  return res.data
}
