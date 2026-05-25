import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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