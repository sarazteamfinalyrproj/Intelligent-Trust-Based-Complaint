import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']

export default function AnalyticsCharts({ complaints }) {
  const categoryData = useMemo(() => {
    const categories = {}
    complaints.forEach(c => {
      if (!categories[c.category]) {
        categories[c.category] = { total: 0, resolved: 0, pending: 0, critical: 0 }
      }
      categories[c.category].total++
      if (c.status === 'resolved') categories[c.category].resolved++
      if (c.status === 'pending') categories[c.category].pending++
      if (c.severity === 'critical') categories[c.category].critical++
    })

    return Object.entries(categories).map(([category, stats]) => ({
      category,
      ...stats
    }))
  }, [complaints])

  const severityData = useMemo(() => {
    const severity = { low: 0, medium: 0, critical: 0 }
    complaints.forEach(c => {
      severity[c.severity]++
    })

    return [
      { name: 'Low', value: severity.low },
      { name: 'Medium', value: severity.medium },
      { name: 'Critical', value: severity.critical }
    ]
  }, [complaints])

  const statusData = useMemo(() => {
    const status = { pending: 0, in_progress: 0, resolved: 0, reopened: 0 }
    complaints.forEach(c => {
      status[c.status]++
    })

    return [
      { name: 'Pending', value: status.pending },
      { name: 'In Progress', value: status.in_progress },
      { name: 'Resolved', value: status.resolved },
      { name: 'Reopened', value: status.reopened }
    ]
  }, [complaints])

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#4F46E5" name="Total" />
            <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
            <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
            <Bar dataKey="critical" fill="#EF4444" name="Critical" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Avg Resolution Rate</p>
            <p className="text-2xl font-bold text-blue-900">
              {complaints.length > 0 
                ? ((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Resolved</p>
            <p className="text-2xl font-bold text-green-900">
              {complaints.filter(c => c.status === 'resolved').length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Critical Pending</p>
            <p className="text-2xl font-bold text-red-900">
              {complaints.filter(c => c.severity === 'critical' && c.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
