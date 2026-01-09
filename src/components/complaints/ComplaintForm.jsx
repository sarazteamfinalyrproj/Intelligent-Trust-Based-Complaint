import { useState, useEffect } from 'react'
import { createComplaintWithAI, getDepartments } from '../../services/supabase'

export default function ComplaintForm({ onSuccess }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      const data = await getDepartments()
      setDepartments(data)
      if (data.length > 0) {
        setCategory(data[0].category)
      }
    } catch (err) {
      console.error('Error loading departments:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAnalyzing(true)
    setError(null)

    try {
      const complaint = await createComplaintWithAI({
        title,
        category,
        content,
        status: 'pending'
      })
      
      setTitle('')
      setContent('')
      setAnalyzing(false)
      alert(`Complaint submitted successfully!\nSeverity detected: ${complaint.severity || 'Analyzing...'}`)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
      setAnalyzing(false)
    } finally {
      setLoading(false)
    }
  }

  const uniqueCategories = [...new Set(departments.map(d => d.category))]

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Submit Anonymous Complaint</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <p className="text-sm text-blue-700">
            🔒 Your identity is protected. Only Super Admins can access identity mapping for serious cases.
          </p>
        </div>

        {analyzing && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-700">
              🤖 AI is analyzing your complaint for severity and spam detection...
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief summary of your complaint"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            rows="6"
            minLength="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe your complaint in detail (minimum 20 characters)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            {content.length}/20 characters minimum • AI will analyze severity automatically
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  )
}
