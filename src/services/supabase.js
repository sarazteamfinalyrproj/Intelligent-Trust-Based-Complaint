import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signUp = async (email, password, role = 'student') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([{ id: data.user.id, email, role }])

    if (profileError) throw profileError
  }

  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    return { ...user, ...profile }
  }
  
  return null
}

export const createComplaint = async (complaintData) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data: complaint, error: complaintError } = await supabase
    .from('complaints')
    .insert([complaintData])
    .select()
    .single()

  if (complaintError) throw complaintError

  const { error: mapError } = await supabase
    .from('anonymous_map')
    .insert([{ complaint_id: complaint.id, user_id: user.id }])

  if (mapError) throw mapError

  return complaint
}

export const getComplaints = async (filters = {}) => {
  let query = supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export const getUserComplaints = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data: maps, error: mapError } = await supabase
    .from('anonymous_map')
    .select('complaint_id')
    .eq('user_id', user.id)

  if (mapError) throw mapError

  const complaintIds = maps.map(m => m.complaint_id)

  const { data: complaints, error: complaintsError } = await supabase
    .from('complaints')
    .select('*')
    .in('id', complaintIds)
    .order('created_at', { ascending: false })

  if (complaintsError) throw complaintsError
  return complaints
}

export const updateComplaintStatus = async (complaintId, status) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const updates = { status }
  
  if (status === 'in_progress') {
    updates.assigned_to = user.id
  }
  
  if (status === 'resolved') {
    updates.resolved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('id', complaintId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const submitFeedback = async (complaintId, rating, comment) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([{ complaint_id: complaintId, rating, comment }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getDepartments = async () => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')

  if (error) throw error
  return data
}

export const analyzeComplaint = async (complaintId, content) => {
  const { data, error } = await supabase.functions.invoke('analyze-complaint', {
    body: { complaintId, content }
  })

  if (error) throw error
  return data
}

export const detectSpam = async (content, userId) => {
  const { data, error } = await supabase.functions.invoke('detect-spam', {
    body: { content, userId }
  })

  if (error) throw error
  return data
}

export const updateTrustScore = async (userId, action, complaintId = null) => {
  const { data, error } = await supabase.functions.invoke('update-trust-score', {
    body: { userId, action, complaintId }
  })

  if (error) throw error
  return data
}

export const getTrustHistory = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('trust_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}

export const routeComplaint = async (complaintId, category) => {
  const { data, error } = await supabase.functions.invoke('route-complaint', {
    body: { complaintId, category }
  })

  if (error) throw error
  return data
}

export const createComplaintWithAI = async (complaintData) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const spamCheck = await detectSpam(complaintData.content, user.id)
  
  if (spamCheck.isSpam) {
    throw new Error(`Spam detected: ${spamCheck.reasons.join(', ')}`)
  }

  const { data: complaint, error: complaintError } = await supabase
    .from('complaints')
    .insert([{ ...complaintData, severity: 'low' }])
    .select()
    .single()

  if (complaintError) throw complaintError

  const { error: mapError } = await supabase
    .from('anonymous_map')
    .insert([{ complaint_id: complaint.id, user_id: user.id }])

  if (mapError) throw mapError

  try {
    await analyzeComplaint(complaint.id, complaintData.content)
  } catch (error) {
    console.error('AI analysis failed:', error)
  }

  try {
    await routeComplaint(complaint.id, complaintData.category)
  } catch (error) {
    console.error('Auto-routing failed:', error)
  }

  return complaint
}
