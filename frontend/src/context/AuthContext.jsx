import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const response = await api.get('/users/me/')
          setUser(response.data)
        } catch (error) {
          console.error('Failed to restore session', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password })
    await completeSession(response.data)
  }

  const googleLogin = async (idToken) => {
    const response = await api.post('/auth/google/', { id_token: idToken })
    await completeSession(response.data)
  }

  const completeSession = async (authData) => {
    const { access, refresh, user: authenticatedUser } = authData

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)

    if (authenticatedUser) {
      setUser(authenticatedUser)
    } else {
      const meResponse = await api.get('/users/me/')
      setUser(meResponse.data)
    }

    navigate('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    navigate('/login')
  }

  const register = async (payload) => {
    await api.post('/users/register/', payload)
    await login(payload.username, payload.password)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, googleLogin, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)