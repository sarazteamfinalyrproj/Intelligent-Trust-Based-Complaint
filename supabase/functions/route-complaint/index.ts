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
    const { complaintId, category } = await req.json()

    if (!complaintId || !category) {
      throw new Error('Missing complaintId or category')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find department for this category
    const { data: department, error: deptError } = await supabaseClient
      .from('departments')
      .select('*')
      .eq('category', category)
      .single()

    if (deptError || !department) {
      console.log('Department not found for category:', category)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No department found for category',
          category 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Find an admin with matching role
    const { data: admins, error: adminError } = await supabaseClient
      .from('users')
      .select('id, email, role')
      .eq('role', 'admin')
      .limit(10)

    if (adminError || !admins || admins.length === 0) {
      console.log('No admins found')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No admins available',
          department: department.name
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Assign to first available admin (can be enhanced with workload balancing)
    const assignedAdmin = admins[0]

    // Update complaint with assigned admin
    const { data: complaint, error: updateError } = await supabaseClient
      .from('complaints')
      .update({ assigned_to: assignedAdmin.id })
      .eq('id', complaintId)
      .select()
      .single()

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        complaint,
        assignedTo: assignedAdmin.email,
        department: department.name
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
