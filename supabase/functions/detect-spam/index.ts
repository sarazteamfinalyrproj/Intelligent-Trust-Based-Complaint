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
    const { content, userId } = await req.json()

    if (!content || !userId) {
      throw new Error('Missing content or userId')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const keywordSpam = checkKeywordSpam(content)
    const duplicateSpam = await checkDuplicateContent(supabaseClient, content, userId)
    const rateSpam = await checkSubmissionRate(supabaseClient, userId)

    const isSpam = keywordSpam.isSpam || duplicateSpam.isSpam || rateSpam.isSpam
    const reasons = [
      keywordSpam.isSpam ? keywordSpam.reason : null,
      duplicateSpam.isSpam ? duplicateSpam.reason : null,
      rateSpam.isSpam ? rateSpam.reason : null,
    ].filter(Boolean)

    if (isSpam) {
      await supabaseClient
        .from('users')
        .update({ trust_score: supabaseClient.rpc('decrement_trust', { user_id: userId, amount: 10 }) })
        .eq('id', userId)
    }

    return new Response(
      JSON.stringify({
        isSpam,
        reasons,
        severity: isSpam ? 'high' : 'none'
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

function checkKeywordSpam(text: string): { isSpam: boolean; reason: string } {
  const spamKeywords = [
    'test', 'testing', 'asdf', 'qwerty', 'xyz', 'abc123',
    'fake', 'trial', 'demo', 'sample', 'aaaaa', 'bbbbb'
  ]

  const lowerText = text.toLowerCase()
  const foundKeywords = spamKeywords.filter(keyword => lowerText.includes(keyword))

  if (foundKeywords.length > 0) {
    return {
      isSpam: true,
      reason: `Spam keywords detected: ${foundKeywords.join(', ')}`
    }
  }

  if (text.length < 20) {
    return {
      isSpam: true,
      reason: 'Content too short (minimum 20 characters)'
    }
  }

  const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, '')).size
  if (uniqueChars < 5) {
    return {
      isSpam: true,
      reason: 'Repetitive content detected'
    }
  }

  return { isSpam: false, reason: '' }
}

async function checkDuplicateContent(
  supabase: any,
  content: string,
  userId: string
): Promise<{ isSpam: boolean; reason: string }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: userComplaints, error } = await supabase
    .from('anonymous_map')
    .select('complaint_id, complaints(content, created_at)')
    .eq('user_id', userId)

  if (error) return { isSpam: false, reason: '' }

  const recentComplaints = userComplaints?.filter(
    (item: any) => item.complaints?.created_at > oneDayAgo
  ) || []

  for (const item of recentComplaints) {
    if (item.complaints?.content === content) {
      return {
        isSpam: true,
        reason: 'Duplicate complaint detected within 24 hours'
      }
    }
  }

  return { isSpam: false, reason: '' }
}

async function checkSubmissionRate(
  supabase: any,
  userId: string
): Promise<{ isSpam: boolean; reason: string }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('anonymous_map')
    .select('complaint_id', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo)

  if (error) return { isSpam: false, reason: '' }

  if (count && count > 5) {
    return {
      isSpam: true,
      reason: `Too many complaints in 24 hours (${count}/5 limit)`
    }
  }

  return { isSpam: false, reason: '' }
}
