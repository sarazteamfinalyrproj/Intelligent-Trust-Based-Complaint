import { useState, useEffect } from 'react'
import { getTrustHistory } from '../../services/supabase'

export default function TrustScoreCard({ score }) {
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (showHistory) {
      loadHistory()
    }
  }, [showHistory])

  const loadHistory = async () => {
    try {
      const data = await getTrustHistory()
      setHistory(data)
    } catch (err) {
      console.error('Error loading trust history:', err)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 70) return 'bg-green-50 border-green-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getScoreLabel = (score) => {
    if (score >= 70) return 'High Trust'
    if (score >= 40) return 'Medium Trust'
    return 'Low Trust'
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${getScoreBgColor(score)}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Trust Score</h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
        <span className="text-sm text-gray-600">/ 100</span>
      </div>
      
      <p className={`text-sm font-medium mt-1 ${getScoreColor(score)}`}>
        {getScoreLabel(score)}
      </p>

      <div className="mt-3">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 space-y-1">
        <p>• Valid complaints: +5 points</p>
        <p>• High ratings: +3 points</p>
        <p>• Spam detected: -10 points</p>
      </div>

      {showHistory && history.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Recent Changes</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((item) => (
              <div key={item.id} className="text-xs bg-white p-2 rounded border border-gray-200">
                <div className="flex justify-between items-start">
                  <span className="text-gray-700 font-medium">
                    {item.action.replace(/_/g, ' ')}
                  </span>
                  <span className={item.change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {item.change > 0 ? '+' : ''}{item.change}
                  </span>
                </div>
                <div className="text-gray-500 mt-1">
                  {item.old_score} → {item.new_score}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showHistory && history.length === 0 && (
        <div className="mt-4 border-t pt-3">
          <p className="text-xs text-gray-500">No history available yet</p>
        </div>
      )}
    </div>
  )
}
