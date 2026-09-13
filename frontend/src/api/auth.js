import client from './client'

export async function signup({ name, email, password, role }) {
  const res = await client.post('/api/auth/signup', { name, email, password, role })
  return res.data
}

export async function login({ email, password }) {
  const res = await client.post('/api/auth/login', { email, password })
  return res.data
}

export async function fetchMe() {
  const res = await client.get('/api/auth/me')
  return res.data
}
