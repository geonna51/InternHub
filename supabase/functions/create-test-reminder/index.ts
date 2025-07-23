import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧪 Creating test reminder...')
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user from the request headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract JWT token from Authorization header
    const jwt = authHeader.replace('Bearer ', '')
    
    // Use the service role client to get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt)
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('👤 Authenticated user:', user.id)

    // Create a test application first
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .insert({
        user_id: user.id,
        company: 'Test Company (Email Test)',
        status: 'applied',
        notes: 'Created for testing email functionality'
      })
      .select()
      .single()

    if (appError) {
      console.error('Error creating test application:', appError)
      return new Response(
        JSON.stringify({ error: 'Failed to create test application', details: appError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Test application created:', application.id)

    // Create a test reminder (due now)
    const now = new Date()
    const { data: reminder, error: reminderError } = await supabaseClient
      .from('reminders')
      .insert({
        user_id: user.id,
        application_id: application.id,
        reminder_date: now.toISOString(),
        email_sent: false
      })
      .select()
      .single()

    if (reminderError) {
      console.error('Error creating test reminder:', reminderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create test reminder', details: reminderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Test reminder created:', reminder.id)

    return new Response(
      JSON.stringify({
        message: 'Test reminder created successfully',
        application_id: application.id,
        reminder_id: reminder.id,
        reminder_date: reminder.reminder_date
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in create-test-reminder:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 