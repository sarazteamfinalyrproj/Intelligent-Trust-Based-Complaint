import { useState, useEffect } from 'react'

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

export default function ComplaintList({ complaints, onComplaintClick, showStatus = true }) {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">No complaints found</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-200">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            onClick={() => onComplaintClick && onComplaintClick(complaint)}
            className={`p-6 ${onComplaintClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
