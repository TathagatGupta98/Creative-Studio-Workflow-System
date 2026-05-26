import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'
const normalizedBaseUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl : `${apiBaseUrl}/api`

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const publicPaths = ['/auth/login/', '/auth/refresh/', '/users/register/']
  const requestUrl = config.url || ''
  const isPublic = publicPaths.some((path) => requestUrl.startsWith(path))
  const token = localStorage.getItem('access_token')

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api