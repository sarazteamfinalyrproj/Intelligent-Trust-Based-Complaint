import { useState, useEffect } from 'react'
import { getCurrentUser, supabase } from './services/supabase'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  useEffect(() => {
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('Error checking user:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    checkUser()
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return showSignUp ? (
      <SignUp 
        onSuccess={handleAuthSuccess} 
        onToggle={() => setShowSignUp(false)} 
      />
    ) : (
      <Login 
        onSuccess={handleAuthSuccess} 
        onToggle={() => setShowSignUp(true)} 
      />
    )
  }

  if (user.role === 'super_admin') {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} />
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  }

  return <StudentDashboard user={user} onLogout={handleLogout} />
}

export default App
