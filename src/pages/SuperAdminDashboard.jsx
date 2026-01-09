import { useState, useEffect } from 'react'
import { getComplaints, signOut, supabase } from '../services/supabase'
import ComplaintList from '../components/complaints/ComplaintList'
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts'

export default function SuperAdminDashboard({ user, onLogout }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [identityInfo, setIdentityInfo] = useState(null)
  const [view, setView] = useState('complaints')

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = async () => {
    try {
      const data = await getComplaints()
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

  const viewIdentity = async (complaintId) => {
    try {
      const { data, error } = await supabase
        .from('anonymous_map')
        .select('user_id, users(email)')
        .eq('complaint_id', complaintId)
        .single()

      if (error) throw error
      setIdentityInfo(data)
    } catch (err) {
      console.error('Error fetching identity:', err)
      alert('Failed to fetch identity information')
    }
  }

  const stats = {
    total: complaints.length,
    critical: complaints.filter(c => c.severity === 'critical').length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Super Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-indigo-100">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-indigo-100 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setView('complaints')}
                className={`px-4 py-2 rounded-md ${view === 'complaints' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Complaints
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-md ${view === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Analytics
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : view === 'analytics' ? (
            <AnalyticsCharts complaints={complaints} />
          ) : selectedComplaint ? (
            <div className="bg-white shadow rounded-lg p-6">
              <button
                onClick={() => {
                  setSelectedComplaint(null)
                  setIdentityInfo(null)
                }}
                className="mb-4 text-indigo-600 hover:text-indigo-800"
              >
                ← Back to list
              </button>
              
              <h2 className="text-2xl font-bold mb-4">{selectedComplaint.title}</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-700">
                  ⚠️ Identity viewing is logged for audit purposes
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Category: </span>
                  <span className="font-medium">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Severity: </span>
                  <span className="font-medium">{selectedComplaint.severity}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status: </span>
                  <span className="font-medium">{selectedComplaint.status}</span>
                </div>
                <div>
                  <p className="text-gray-700">{selectedComplaint.content}</p>
                </div>
              </div>

              {identityInfo ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                  <p className="text-sm font-medium text-red-900">Student Identity:</p>
                  <p className="text-red-700">{identityInfo.users?.email || 'Email not found'}</p>
                </div>
              ) : (
                <button
                  onClick={() => viewIdentity(selectedComplaint.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  View Student Identity
                </button>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">All Complaints (Full Access)</h2>
              <ComplaintList 
                complaints={complaints} 
                onComplaintClick={setSelectedComplaint}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
