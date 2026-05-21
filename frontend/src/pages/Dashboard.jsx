import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            Sign out
          </button>
        </div>
        {user && (
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{user.username}</span>!
          </p>
        )}
      </div>
    </div>
  )
}