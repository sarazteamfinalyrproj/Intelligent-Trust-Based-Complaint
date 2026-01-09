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
    const { complaintId, content } = await req.json()

    if (!complaintId || !content) {
      throw new Error('Missing complaintId or content')
    }

    const sentimentScore = analyzeSentiment(content)
    const severity = calculateSeverity(sentimentScore)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseClient
      .from('complaints')
      .update({ severity })
      .eq('id', complaintId)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        sentimentScore,
        severity,
        complaint: data
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

function analyzeSentiment(text: string): number {
  const lowerText = text.toLowerCase()
  
  const negativeWords = [
    'terrible', 'horrible', 'worst', 'disgusting', 'awful', 'bad', 'poor',
    'unhygienic', 'dirty', 'unacceptable', 'pathetic', 'useless', 'hate',
    'harassment', 'ragging', 'abuse', 'threat', 'violence', 'discrimination',
    'urgent', 'immediately', 'emergency', 'danger', 'unsafe', 'critical'
  ]
  
  const moderateWords = [
    'problem', 'issue', 'concern', 'complaint', 'difficult', 'inconvenient',
    'disappointed', 'unsatisfied', 'unfair', 'lacking', 'insufficient',
    'need', 'should', 'must', 'fix', 'improve', 'better'
  ]
  
  const positiveWords = [
    'good', 'great', 'excellent', 'thank', 'appreciate', 'happy',
    'satisfied', 'request', 'suggest', 'kindly', 'please'
  ]
  
  let score = 0
  const words = lowerText.split(/\s+/)
  
  for (const word of words) {
    if (negativeWords.some(nw => word.includes(nw))) {
      score -= 1
    }
    if (moderateWords.some(mw => word.includes(mw))) {
      score -= 0.3
    }
    if (positiveWords.some(pw => word.includes(pw))) {
      score += 0.5
    }
  }
  
  const normalizedScore = score / Math.max(words.length, 10)
  return Math.max(-1, Math.min(1, normalizedScore))
}

function calculateSeverity(sentimentScore: number): string {
  if (sentimentScore < -0.6) return 'critical'
  if (sentimentScore < -0.2) return 'medium'
  return 'low'
}
