import { useState } from 'react'
import { submitFeedback } from '../../services/supabase'

export default function FeedbackModal({ complaint, onClose, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await submitFeedback(complaint.id, rating, comment)
      alert('Feedback submitted successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Rate Resolution</h2>
        <p className="text-gray-600 mb-4">How satisfied are you with the resolution of your complaint?</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">{complaint.title}</p>
            <p className="text-xs text-gray-500">Category: {complaint.category}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Very Dissatisfied'}
              {rating === 2 && 'Dissatisfied'}
              {rating === 3 && 'Neutral'}
              {rating === 4 && 'Satisfied'}
              {rating === 5 && 'Very Satisfied'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Share your feedback about the resolution..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {rating < 3 && rating > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-700">
                ⚠️ Low ratings will reopen the complaint for review
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
