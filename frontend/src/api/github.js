import client from './client'

export async function getGithubConnectUrl() {
  const res = await client.get('/api/github/connect')
  return res.data.authorize_url
}

export async function listGithubRepos() {
  const res = await client.get('/api/github/repos')
  return res.data
}
