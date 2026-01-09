import { useState, useEffect } from 'react'
import { getComplaints, updateComplaintStatus, signOut } from '../services/supabase'
import ComplaintList from '../components/complaints/ComplaintList'

export default function AdminDashboard({ user, onLogout }) {
  const [complaints, setComplaints] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  useEffect(() => {
    loadComplaints()
  }, [filter])

  const loadComplaints = async () => {
    try {
      const filters = filter === 'all' ? {} : { status: filter }
      const data = await getComplaints(filters)
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

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus)
      loadComplaints()
      setSelectedComplaint(null)
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update complaint status')
    }
  }

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-4 py-2 rounded-md ${filter === 'in_progress' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-4 py-2 rounded-md ${filter === 'resolved' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : selectedComplaint ? (
            <div className="bg-white shadow rounded-lg p-6">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="mb-4 text-indigo-600 hover:text-indigo-800"
              >
                ← Back to list
              </button>
              
              <h2 className="text-2xl font-bold mb-4">{selectedComplaint.title}</h2>
              <div className="mb-4">
                <span className="text-sm text-gray-600">Category: </span>
                <span className="font-medium">{selectedComplaint.category}</span>
              </div>
              <div className="mb-4">
                <span className="text-sm text-gray-600">Severity: </span>
                <span className="font-medium">{selectedComplaint.severity}</span>
              </div>
              <div className="mb-4">
                <p className="text-gray-700">{selectedComplaint.content}</p>
              </div>
              
              <div className="flex gap-2 mt-6">
                {selectedComplaint.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'in_progress')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Start Working
                  </button>
                )}
                {selectedComplaint.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'resolved')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ) : (
            <ComplaintList 
              complaints={complaints} 
              onComplaintClick={setSelectedComplaint}
              showChat={true}
              currentUserRole="admin"
            />
          )}
        </div>
      </main>
    </div>
  )
}
