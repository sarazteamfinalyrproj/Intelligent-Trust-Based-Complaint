import { useState, useEffect } from 'react'
import FeedbackModal from './FeedbackModal'
import MessageThread from '../messaging/MessageThread'

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800'
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  reopened: 'bg-orange-100 text-orange-800'
}

export default function ComplaintList({ complaints, onComplaintClick, showStatus = true, showFeedback = false, showChat = false, currentUserRole, onFeedbackSuccess }) {
  const [selectedForFeedback, setSelectedForFeedback] = useState(null)
  const [selectedForChat, setSelectedForChat] = useState(null)

  if (!complaints || complaints.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">No complaints found</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="p-6">
              <div className="flex items-start justify-between">
                <div
                  onClick={() => onComplaintClick && onComplaintClick(complaint)}
                  className={`flex-1 ${onComplaintClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {complaint.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${severityColors[complaint.severity]}`}>
                      {complaint.severity}
                    </span>
                    {showStatus && (
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[complaint.status]}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{complaint.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Category:</span> {complaint.category}
                    </span>
                    <span>
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  {showFeedback && complaint.status === 'resolved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedForFeedback(complaint)
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                    >
                      Rate Resolution
                    </button>
                  )}
                  {showChat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedForChat(complaint)
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      💬 Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedForFeedback && (
        <FeedbackModal
          complaint={selectedForFeedback}
          onClose={() => setSelectedForFeedback(null)}
          onSuccess={() => {
            setSelectedForFeedback(null)
            if (onFeedbackSuccess) onFeedbackSuccess()
          }}
        />
      )}

      {selectedForChat && (
        <MessageThread
          complaintId={selectedForChat.id}
          currentUserRole={currentUserRole}
          onClose={() => setSelectedForChat(null)}
        />
      )}
    </>
  )
}
