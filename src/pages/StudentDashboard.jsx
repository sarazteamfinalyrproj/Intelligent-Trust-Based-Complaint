import { useState, useEffect } from 'react'
import { getUserComplaints, signOut } from '../services/supabase'
import ComplaintForm from '../components/complaints/ComplaintForm'
import ComplaintList from '../components/complaints/ComplaintList'

export default function StudentDashboard({ user, onLogout }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = async () => {
    try {
      const data = await getUserComplaints()
      setComplaints(data)
    } catch (err) {
      console.error('Error loading complaints:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    onLogout()
  }

  const handleComplaintSubmitted = () => {
    setShowForm(false)
    loadComplaints()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Trust Score:</span>
                <span className="ml-2 font-semibold text-indigo-600">{user.trust_score || 50}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">My Complaints</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {showForm ? 'View Complaints' : 'New Complaint'}
            </button>
          </div>

          {showForm ? (
            <ComplaintForm onSuccess={handleComplaintSubmitted} />
          ) : loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <ComplaintList complaints={complaints} />
          )}
        </div>
      </main>
    </div>
  )
}
