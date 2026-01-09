import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, action, complaintId } = await req.json()

    if (!userId || !action) {
      throw new Error('Missing userId or action')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: user } = await supabaseClient
      .from('users')
      .select('trust_score')
      .eq('id', userId)
      .single()

    const currentScore = user?.trust_score || 50
    const scoreChange = calculateScoreChange(action, currentScore)
    const newScore = Math.max(0, Math.min(100, currentScore + scoreChange))

    const { data: updatedUser, error } = await supabaseClient
      .from('users')
      .update({ trust_score: newScore })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    await supabaseClient
      .from('trust_history')
      .insert({
        user_id: userId,
        complaint_id: complaintId,
        action,
        old_score: currentScore,
        new_score: newScore,
        change: scoreChange
      })

    return new Response(
      JSON.stringify({
        success: true,
        oldScore: currentScore,
        newScore,
        change: scoreChange,
        action
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function calculateScoreChange(action: string, currentScore: number): number {
  const changes: { [key: string]: number } = {
    'complaint_resolved_positive': 5,
    'complaint_validated': 5,
    'repeated_valid': 2,
    'spam_detected': -10,
    'false_complaint': -15,
    'low_rating': -5,
    'high_rating': 3,
  }

  let baseChange = changes[action] || 0

  if (currentScore < 20 && baseChange < 0) {
    baseChange = baseChange * 0.5
  }

  if (currentScore > 80 && baseChange > 0) {
    baseChange = baseChange * 0.7
  }

  return Math.round(baseChange)
}
